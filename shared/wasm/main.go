// Nocturne's cross-platform adapter. Meiro's GPLv3 YouTube client includes Nocturne metadata fixes.
//go:build js && wasm

package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"nocturne/lrclib"
	"nocturne/youtube"
	"strings"
	"syscall/js"
	"time"
)

type transport struct{}

func (transport) RoundTrip(r *http.Request) (*http.Response, error) {
	body := []byte{}
	if r.Body != nil {
		body, _ = io.ReadAll(r.Body)
	}
	headers := map[string]string{}
	for k, v := range r.Header {
		headers[k] = strings.Join(v, ", ")
	}
	data, _ := json.Marshal(map[string]any{"url": r.URL.String(), "method": r.Method, "headers": headers, "body": string(body)})
	type reply struct {
		value js.Value
		err   error
	}
	done := make(chan reply, 1)
	ok := js.FuncOf(func(_ js.Value, args []js.Value) any { done <- reply{value: args[0]}; return nil })
	fail := js.FuncOf(func(_ js.Value, args []js.Value) any {
		done <- reply{err: fmt.Errorf("YouTube Music não respondeu. Confira a conexão e a sessão.")}
		return nil
	})
	js.Global().Call("nocturneHttp", string(data)).Call("then", ok).Call("catch", fail)
	// Native requests have a 30s deadline. Keep callback lifetimes until they finish.
	response := <-done
	ok.Release()
	fail.Release()
	if response.err != nil {
		return nil, response.err
	}
	var raw struct {
		Status int    `json:"status"`
		Body   string `json:"body"`
	}
	if err := json.Unmarshal([]byte(response.value.String()), &raw); err != nil {
		return nil, err
	}
	return &http.Response{StatusCode: raw.Status, Status: fmt.Sprint(raw.Status), Header: make(http.Header), Body: io.NopCloser(strings.NewReader(raw.Body)), Request: r}, nil
}

var guest, signed *youtube.Client

type request struct {
	Artist        string  `json:"artist"`
	Album         string  `json:"album"`
	Duration      float64 `json:"duration"`
	Op            string  `json:"op"`
	ID            string  `json:"id"`
	Query         string  `json:"query"`
	Kind          string  `json:"kind"`
	Params        string  `json:"params"`
	Continuation  string  `json:"continuation"`
	Title         string  `json:"title"`
	VideoID       string  `json:"videoId"`
	SetID         string  `json:"setId"`
	Enabled       bool    `json:"enabled"`
	Authenticated bool    `json:"authenticated"`
}

func item(v youtube.MusicItem) map[string]any {
	return map[string]any{"id": v.VideoID, "title": v.Title, "artists": first(v.Artists, v.Artist, v.Subtitle), "artistId": v.ArtistID(), "albumName": v.Album, "albumId": v.AlbumBrowseID, "thumbnail": v.Thumbnail, "duration": v.Duration, "playlistSetId": v.PlaylistSetID}
}
func first(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
func items(values []youtube.MusicItem) ([]any, []any) {
	songs := []any{}
	collections := []any{}
	for _, v := range values {
		target := v.Target()
		if target.Kind == youtube.TargetTrack {
			songs = append(songs, item(v))
		} else if target.Opens() {
			kind := "album"
			switch target.Kind {
			case youtube.TargetArtist:
				kind = "artist"
			case youtube.TargetPlaylist:
				kind = "playlist"
			case youtube.TargetPodcast:
				kind = "podcast"
			}
			collections = append(collections, map[string]any{"id": target.ID, "type": kind, "title": v.Title, "artists": v.Subtitle, "thumbnail": v.Thumbnail})
		}
	}
	return songs, collections
}
func page(v *youtube.BrowseResult) map[string]any {
	songs, collections := items(v.Items)
	sections := []any{}
	for _, s := range v.Sections {
		ss, cc := items(s.Items)
		sections = append(sections, map[string]any{"title": s.Title, "songs": ss, "collections": cc, "continuation": s.ContinuationToken})
	}
	return map[string]any{"title": v.Title, "description": v.Description, "thumbnail": v.Thumbnail, "songs": songs, "collections": collections, "sections": sections, "continuation": v.ContinuationToken, "artists": []any{}}
}
func dispatch(r request) (any, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	c := guest
	if r.Authenticated {
		c = signed
	}
	switch r.Op {
	case "search":
		v, e := c.Search(ctx, r.Query, youtube.SearchOptions{Params: r.Params})
		if e != nil {
			return nil, e
		}
		songs, collections := items(v.Items)
		return map[string]any{"songs": songs, "collections": collections, "filters": v.Filters, "continuation": v.ContinuationToken}, nil
	case "search-more":
		v, e := c.ContinueSearch(ctx, r.Continuation)
		if e != nil {
			return nil, e
		}
		songs, collections := items(v.Items)
		return map[string]any{"songs": songs, "collections": collections, "continuation": v.ContinuationToken}, nil
	case "suggestions":
		return c.GetSearchSuggestions(ctx, r.Query)
	case "home", "explore", "library", "album", "artist", "artist-tracks", "playlist", "podcast", "recap", "browse-more", "radio", "related":
		var v *youtube.BrowseResult
		var e error
		switch r.Op {
		case "home":
			v, e = c.GetHomeFeed(ctx)
		case "explore":
			v, e = c.GetExplore(ctx)
		case "library":
			v, e = c.GetLibrary(ctx)
		case "album":
			v, e = c.GetAlbum(ctx, r.ID)
		case "artist", "artist-tracks":
			v, e = c.GetArtist(ctx, r.ID)
		case "playlist":
			v, e = c.GetPlaylist(ctx, r.ID)
		case "podcast":
			v, e = c.GetPodcast(ctx, r.ID)
		case "recap":
			v, e = c.GetRecap(ctx)
		case "browse-more":
			v, e = c.ContinueBrowse(ctx, r.Continuation)
		case "radio":
			v, e = c.GetUpNext(ctx, youtube.UpNextOptions{VideoID: r.ID, Continuation: r.Continuation})
		case "related":
			v, e = c.GetRelated(ctx, r.ID)
		}
		if e != nil {
			return nil, e
		}
		return page(v), nil
	case "stream":
		u, length, e := guest.AudioStream(ctx, r.ID)
		return map[string]any{"url": u, "duration": length.Seconds()}, e
	case "lyrics":
		plain, source := "", "YouTube Music"
		lrc := strings.Builder{}
		v, ytErr := c.GetLyrics(ctx, r.ID)
		if ytErr == nil && v != nil {
			plain, source = v.Description, v.Footer
			for _, l := range v.Timed {
				sec := l.Start.Seconds()
				fmt.Fprintf(&lrc, "[%02d:%05.2f]%s\n", int(sec)/60, sec-float64(int(sec)/60*60), l.Text)
			}
		}
		instrumental := false
		if lrc.Len() == 0 && r.Title != "" && r.Artist != "" {
			lc := &lrclib.Client{HTTP: &http.Client{Transport: transport{}}}
			extra, err := lc.Get(ctx, lrclib.Query{Title: r.Title, Artist: r.Artist, Album: r.Album, Duration: time.Duration(r.Duration * float64(time.Second))})
			if err == nil && extra != nil {
				instrumental = extra.Instrumental
				if plain == "" {
					plain, source = extra.Plain, "LRCLIB"
				}
				if len(extra.Synced) > 0 {
					source = "LRCLIB"
					for _, l := range extra.Synced {
						sec := l.At.Seconds()
						fmt.Fprintf(&lrc, "[%02d:%05.2f]%s\n", int(sec)/60, sec-float64(int(sec)/60*60), l.Text)
					}
				}
			}
		}
		return map[string]any{"plainLyrics": plain, "syncedLyrics": lrc.String(), "source": source, "instrumental": instrumental}, nil
	case "account":
		v, e := signed.GetAccountDetails(ctx)
		if e != nil {
			return nil, e
		}
		return map[string]any{"name": v.Name, "thumbnail": v.Thumbnail, "channelId": v.ChannelID}, nil
	case "accounts":
		return signed.GetAccounts(ctx)
	case "report-playback":
		if !r.Authenticated {
			return map[string]any{"ok": true}, nil
		}
		return map[string]any{"ok": true}, signed.ReportPlayback(ctx, r.ID)
	case "rate":
		return map[string]any{"ok": true}, signed.RateTrack(ctx, r.ID, r.Enabled)
	case "subscribe":
		var e error
		if r.Enabled {
			e = signed.Subscribe(ctx, r.ID)
		} else {
			e = signed.Unsubscribe(ctx, r.ID)
		}
		return map[string]any{"ok": true}, e
	case "library-save":
		var e error
		if r.Enabled {
			e = signed.AddToLibrary(ctx, r.ID)
		} else {
			e = signed.RemoveFromLibrary(ctx, r.ID)
		}
		return map[string]any{"ok": true}, e
	case "playlist-create":
		id, e := signed.CreatePlaylist(ctx, r.Title)
		return map[string]any{"id": id}, e
	case "playlist-add":
		return map[string]any{"ok": true}, signed.AddToPlaylist(ctx, r.ID, r.VideoID)
	case "playlist-remove":
		return map[string]any{"ok": true}, signed.RemoveFromPlaylist(ctx, r.ID, r.SetID)
	case "playlist-delete":
		return map[string]any{"ok": true}, signed.DeletePlaylist(ctx, r.ID)
	}
	return nil, fmt.Errorf("Operação YouTube Music indisponível")
}
func main() {
	log.SetOutput(io.Discard)
	httpClient := &http.Client{Transport: transport{}}
	guest = youtube.NewClient(youtube.Options{HTTPClient: httpClient, Language: "pt", Country: "BR"})
	auth, _ := youtube.NewCookieAuth("SAPISID=native-session", youtube.CookieOptions{})
	signed = youtube.NewClient(youtube.Options{HTTPClient: httpClient, Language: "pt", Country: "BR", CookieAuth: auth})
	js.Global().Set("nocturneYouTube", js.FuncOf(func(_ js.Value, args []js.Value) any {
		input := args[0].String()
		handler := js.FuncOf(func(_ js.Value, callbacks []js.Value) any {
			resolve := callbacks[0]
			go func() {
				defer func() {
					if recover() != nil {
						resolve.Invoke(`{"error":"O cliente YouTube Music não conseguiu concluir a operação."}`)
					}
				}()
				var r request
				if json.Unmarshal([]byte(input), &r) != nil {
					resolve.Invoke(`{"error":"Pedido inválido"}`)
					return
				}
				result, e := dispatch(r)
				if e != nil {
					result = map[string]any{"error": e.Error()}
				}
				data, _ := json.Marshal(result)
				resolve.Invoke(string(data))
			}()
			return nil
		})
		promise := js.Global().Get("Promise").New(handler)
		handler.Release()
		return promise
	}))
	select {}
}

package youtube
import "testing"
func TestNocturneHeaderArtist(t *testing.T){
 root:=decodeResponse([]byte(`{"contents":{"musicResponsiveHeaderRenderer":{"title":{"runs":[{"text":"Album"}]},"straplineTextOne":{"runs":[{"text":"Che","navigationEndpoint":{"browseEndpoint":{"browseId":"UCabc"}}}]}}},"recommendation":{"runs":[{"text":"Other","navigationEndpoint":{"browseEndpoint":{"browseId":"UCother"}}}]}}`))
 artists:=headerArtists(root);if len(artists)!=1||artists[0].ID!="UCabc"||artists[0].Name!="Che"{t.Fatalf("wrong header artists: %#v",artists)}
 track:=MusicItem{VideoID:"song",BrowseID:"MPRalbum",ArtistBrowseID:"UCabc"};if track.ArtistID()!="UCabc"{t.Fatal("artist lost behind album navigation")}
}

import contextlib
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

def thumbnail(item):
    images=item.get('thumbnails') or item.get('thumbnail') or []
    return max(images,key=lambda i:(i.get('width') or 0)*(i.get('height') or 0),default={}).get('url','')

def track(item, album=None, artists=None):
    people = item.get('artists') or artists or []
    release = item.get('album') if isinstance(item.get('album'), dict) else album or {}
    return {'id': item.get('videoId'), 'title': item.get('title', ''),
            'artists': ', '.join(p.get('name', '') for p in people),
            'artistId': next((p['id'] for p in people if p.get('id')), ''),
            'albumId': release.get('id', ''), 'albumName': release.get('name', ''),
            'duration': item.get('duration') or item.get('length', ''), 'thumbnail': thumbnail(item) or release.get('thumbnail', '')}

def tracks(items, album=None, artists=None):
    return [track(item, album, artists) for item in items if re.fullmatch(r'[A-Za-z0-9_-]{11}', item.get('videoId') or '')]

def collection(item, kind):
    return {'type': kind, 'id': item.get('browseId') or item.get('artistId') or '',
            'title': item.get('title') or item.get('artist') or item.get('name') or '',
            'artists': ', '.join(p.get('name', '') for p in item.get('artists', [])),
            'year': str(item.get('year') or ''), 'thumbnail': thumbnail(item)}

def handle(request):
    operation = request.get('op')
    if operation == 'search':
        from ytmusicapi import YTMusic
        query = str(request.get('query', '')).strip()
        if not query or len(query) > 200:
            raise ValueError('Digite uma busca de até 200 caracteres.')
        kind = request.get('kind', 'songs')
        if kind not in ('songs', 'albums', 'artists'):
            raise ValueError('Tipo de busca inválido.')
        results = YTMusic(language='en', location='BR').search(query, filter=kind, limit=25)
        return {'songs': tracks(results)[:25], 'collections': [collection(item, 'album' if kind == 'albums' else 'artist') for item in results][:25] if kind != 'songs' else []}
    if operation in ('album', 'artist', 'artist-tracks'):
        from ytmusicapi import YTMusic
        browse = request.get('id', '')
        if not isinstance(browse, str) or not re.fullmatch(r'[A-Za-z0-9_-]{2,160}', browse):
            raise ValueError('Identificador inválido.')
        client = YTMusic(language='en', location='BR')
        if operation == 'album':
            if not browse.startswith('MPRE'):
                raise ValueError('Álbum inválido.')
            album = client.get_album(browse)
            release = {'id': browse, 'name': album.get('title', ''), 'thumbnail': thumbnail(album)}
            return {'title': album.get('title', ''), 'description': album.get('description', ''),
                    'year': album.get('year', ''), 'thumbnail': thumbnail(album),
                    'artists': album.get('artists', []), 'songs': tracks(album.get('tracks', []), release, album.get('artists', []))}
        if operation == 'artist-tracks':
            playlist = client.get_playlist(browse.removeprefix('VL'), limit=100)
            return {'songs': tracks(playlist.get('tracks', []))[:100]}
        if not browse.startswith('UC'):
            raise ValueError('Artista inválido.')
        artist = client.get_artist(browse)
        people = [{'id': browse, 'name': artist.get('name', '')}]
        albums = artist.get('albums', {}) or {}
        singles = artist.get('singles', {}) or {}
        releases = albums.get('results', []) + singles.get('results', [])
        return {'title': artist.get('name', ''), 'description': artist.get('description', ''),
                'thumbnail': thumbnail(artist), 'subscribers': artist.get('subscribers', ''),
                'songs': tracks((artist.get('songs') or {}).get('results', []), artists=people),
                'songsId': (artist.get('songs') or {}).get('browseId', ''),
                'collections': [collection(item, 'album') for item in releases]}
    if operation == 'radio':
        from ytmusicapi import YTMusic
        video = request.get('id', '')
        if not isinstance(video, str) or not re.fullmatch(r'[A-Za-z0-9_-]{11}', video):
            raise ValueError('Identificador inválido.')
        result = YTMusic(language='en', location='BR').get_watch_playlist(videoId=video, radio=True, limit=25)
        return {'songs': tracks(result.get('tracks', []))[:25]}
    if operation == 'lyrics':
        import requests
        title = str(request.get('title', '')).strip()[:300]
        artist = str(request.get('artist', '')).strip()[:300]
        if not title or not artist:
            raise ValueError('Selecione uma faixa com título e artista.')
        response = requests.get('https://lrclib.net/api/get', params={'track_name': title, 'artist_name': artist},
                                headers={'User-Agent': 'YuriMusic/0.5 (personal music player)'}, timeout=20)
        if response.status_code == 404:
            return {'plainLyrics': None, 'syncedLyrics': None}
        response.raise_for_status()
        data = response.json()
        return {key: data.get(key) for key in ('plainLyrics', 'syncedLyrics', 'instrumental')}
    if operation == 'download':
        from yt_dlp import YoutubeDL
        video = request.get('id', '')
        if not isinstance(video, str) or not re.fullmatch(r'[A-Za-z0-9_-]{11}', video):
            raise ValueError('Identificador inválido.')
        directory = Path(request.get('directory', ''))
        if not directory.is_absolute() or not directory.is_dir():
            raise ValueError('Pasta de downloads inválida.')
        with YoutubeDL({'quiet': True, 'no_warnings': True, 'noplaylist': True,
                        'socket_timeout': 20, 'retries': 1, 'continuedl': True,
                        'max_filesize': 512 * 1024 * 1024,
                        'format': 'bestaudio[ext=m4a]/bestaudio',
                        'outtmpl': str(directory / (video + '.%(ext)s'))}) as client:
            info = client.extract_info('https://www.youtube.com/watch?v=' + video, download=True)
            path = Path(client.prepare_filename(info))
        if not path.is_file() or path.parent.resolve() != directory.resolve():
            raise ValueError('O download não foi concluído.')
        return {'file': path.name, 'bytes': path.stat().st_size}
    if operation == 'stream':
        from yt_dlp import YoutubeDL
        video = request.get('id', '')
        if not isinstance(video, str) or not re.fullmatch(r'[A-Za-z0-9_-]{11}', video):
            raise ValueError('Identificador inválido.')
        with YoutubeDL({'quiet': True, 'no_warnings': True, 'noplaylist': True,
                        'socket_timeout': 20, 'retries': 1, 'format': 'bestaudio[ext=m4a]/bestaudio',
                        'skip_download': True}) as client:
            info = client.extract_info('https://www.youtube.com/watch?v=' + video, download=False)
        url = info.get('url', '')
        host = urlparse(url).hostname or ''
        if not url.startswith('https://') or not host.endswith('.googlevideo.com'):
            raise ValueError('O YouTube não disponibilizou um endereço de áudio compatível.')
        return {'url': url, 'codec': info.get('acodec'), 'bitrate': info.get('abr')}
    raise ValueError('Operação inválida.')

if __name__ == '__main__':
    try:
        request = json.loads(sys.stdin.readline(16384))
        with contextlib.redirect_stdout(sys.stderr):
            result = handle(request)
    except Exception as error:
        import traceback
        traceback.print_exc(file=sys.stderr)
        result = {'error': 'Não foi possível concluir: ' + str(error)[:500]}
    sys.stdout.write(json.dumps(result, ensure_ascii=True))

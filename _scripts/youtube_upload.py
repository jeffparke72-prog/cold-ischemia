"""Upload a video to YouTube using the YouTube Data API v3.
Env: YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN. Usage: python youtube_upload.py _social/youtube/founder-message.json
Uploads as PRIVATE by default (set privacyStatus in the JSON). Unverified API projects are always forced to private by YouTube."""
import json, os, sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
meta = json.load(open(sys.argv[1]))
creds = Credentials(None, refresh_token=os.environ['YT_REFRESH_TOKEN'], token_uri='https://oauth2.googleapis.com/token',
                    client_id=os.environ['YT_CLIENT_ID'], client_secret=os.environ['YT_CLIENT_SECRET'],
                    scopes=['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.force-ssl'])
yt = build('youtube', 'v3', credentials=creds)
body = {'snippet': {'title': meta['title'], 'description': meta['description'], 'tags': meta['tags'], 'categoryId': meta.get('categoryId', '29'), 'defaultLanguage': meta.get('defaultLanguage', 'en')},
        'status': {'privacyStatus': meta.get('privacyStatus', 'private'), 'selfDeclaredMadeForKids': bool(meta.get('madeForKids', False))}}
req = yt.videos().insert(part='snippet,status', body=body, media_body=MediaFileUpload(meta['video'], chunksize=8 * 1024 * 1024, resumable=True))
resp = None
while resp is None:
    st, resp = req.next_chunk()
    if st: print(f'uploaded {int(st.progress() * 100)}%')
vid = resp['id']
print('video id', vid, 'https://youtu.be/' + vid)
try:
    yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(meta['thumbnail'])).execute(); print('thumbnail set')
except Exception as e: print('thumbnail failed:', e)
try:
    yt.captions().insert(part='snippet', body={'snippet': {'videoId': vid, 'language': 'en', 'name': 'English'}}, media_body=MediaFileUpload(meta['captions'], mimetype='application/octet-stream')).execute(); print('captions set')
except Exception as e: print('captions failed:', e)

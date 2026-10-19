# Post to YouTube automatically (optional, about 20 minutes, one time)

Uploading by hand takes about five minutes: go to studio.youtube.com, choose Create, Upload videos, pick the MP4, paste the title and description from `_filmwork/founder/youtube-description.txt`, set the thumbnail to `_filmwork/founder/youtube-thumbnail.jpg`, and upload the captions file `_filmwork/founder/founder-message.srt` under Subtitles.

To let the repository do it for you:

1. Go to console.cloud.google.com, create a project, and enable **YouTube Data API v3**.
2. Under **APIs & Services, OAuth consent screen**, choose External, add yourself as a test user.
3. Under **Credentials**, create an **OAuth client ID** of type Web application. Add `https://developers.google.com/oauthplayground` as an authorized redirect URI. Copy the client ID and client secret.
4. Open developers.google.com/oauthplayground. Click the gear icon, tick "Use your own OAuth credentials", paste the client ID and secret. In Step 1, enter the scope `https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl`, authorize with the Google account that owns your channel, then in Step 2 click "Exchange authorization code for tokens". Copy the **refresh token**.
5. In the GitHub repository, go to Settings, Secrets and variables, Actions, and add three secrets: `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
6. Go to Actions, "Upload video to YouTube", Run workflow. The video, title, description, tags, thumbnail and captions come from `_social/youtube/founder-message.json`.

Notes:
- The upload is private by default. YouTube also forces videos uploaded through an unverified API project to private. Open YouTube Studio and switch it to Public when you are ready.
- Keep the refresh token secret. Anyone who has it can upload to your channel. You can revoke it any time at myaccount.google.com/permissions.

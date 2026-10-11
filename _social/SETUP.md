# Connect the four platforms (one-time, about 1-2 hours; approvals can take days)

Add every value under GitHub: repo Settings -> Secrets and variables -> Actions -> New repository secret.
Check status any time: Actions -> Social autopublish -> Run workflow, then read "Which platforms are connected".
Platform rules and prices change; confirm on each official page below.

## Facebook (Page)
Needs a Facebook **Page** (not a personal profile).
1. developers.facebook.com -> create an app (Business type); add the Facebook Login for Business / Pages API use case.
2. Graph API Explorer: choose your app, request `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`; generate a user token, then call `/me/accounts` to get the **Page ID** and a **Page access token**. Exchange for a long-lived token first so the Page token does not expire.
3. Secrets: `FACEBOOK_PAGE_ID`, `FACEBOOK_PAGE_TOKEN`.
Posting to a Page you admin works in development mode; public use may need App Review.

## Instagram (shares the Facebook app)
1. Convert the Instagram account to **Business or Creator** and link it to the Facebook Page.
2. In the same app add Instagram API (Graph API) permissions `instagram_basic`, `instagram_content_publish`.
3. `GET /{page-id}?fields=instagram_business_account` gives the **Instagram user ID**. Use the long-lived Page token as the token.
4. Secrets: `INSTAGRAM_USER_ID`, `INSTAGRAM_TOKEN`.
Limits: images must be JPEG at a public URL (the script handles this); content publishing is capped per day.

## LinkedIn
1. linkedin.com/developers -> create an app attached to a LinkedIn Page you manage.
2. Products: "Share on LinkedIn" (scope `w_member_social`, posts as you) or "Community Management API" (scope `w_organization_social`, posts as the Page; requires approval).
3. Generate an OAuth 2.0 token (3-legged). Tokens last about 60 days; **set a calendar reminder to renew** (refresh tokens only for approved programs).
4. Author URN: `urn:li:person:<id>` (from `/v2/userinfo` `sub`) or `urn:li:organization:<id>`.
5. Secrets: `LINKEDIN_ACCESS_TOKEN`, `LINKEDIN_AUTHOR_URN`, optional `LINKEDIN_API_VERSION` (format `YYYYMM`; old versions are retired, so update if posts start failing).

## X (Twitter)
1. developer.x.com -> create a project/app; set app permissions to **Read and Write** *before* generating tokens.
2. Generate API Key and Secret, and Access Token and Secret for your account.
3. Secrets: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.
Cost: X moved to pay-per-use credits; posts that contain a link cost more than plain posts. Load a small credit balance; with a few announcements a month the cost is small. Verify current rates in the developer console.

## First test
1. Add secrets for one platform.
2. Actions -> Social autopublish -> Run workflow: `live=false`, `files=about.html` to see the copy.
3. Then `live=true` with a real page you do not mind announcing (already-posted items are skipped by `_social/posted.json`).

## No-code fallback
If any platform approval stalls, point Buffer, Zapier or IFTTT at a feed of new pages instead and let them post. Ask Claude to add a first-party `social-feed.xml`.

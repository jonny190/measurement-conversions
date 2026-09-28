# Measurement Conversions

A dependency-free unit converter: thirteen categories, live conversion as you type,
a full reference table, shareable URLs — and two prepared Google AdSense slots.

Deployed at **https://convert.daveys.xyz** (Cloudflare tunnel → Coolify → nginx container).

## What is in here

| Path | Purpose |
|---|---|
| `site/index.html` | Markup, including the two labelled ad slots |
| `site/app.js` | Conversion engine, UI wiring, AdSense injection |
| `site/config.js` | **The only file to edit to go live with AdSense** |
| `site/styles.css` | Light/dark responsive styling |
| `site/ads.txt` | AdSense authorisation file (placeholder publisher ID) |
| `nginx.conf` | Static server config: gzip, cache headers, `/healthz` |
| `Dockerfile` | `nginx:alpine` + the site directory. No build step. |

There is no bundler, no npm install and no runtime dependency. The image is a
static nginx container, so a deploy is a `COPY` and finishes in seconds.

## Categories

Length · Mass · Volume · Temperature · Area · Speed · Time · Data · Pressure ·
Energy · Power · Angle · Frequency

Temperature is handled as an affine transform (offset as well as scale); every
other category is a simple ratio against a base unit. US and imperial volumes are
listed separately on purpose — a US pint is not an imperial pint, and the labels
say which is which.

## Enabling Google AdSense

1. Get your publisher ID (`ca-pub-…`) from AdSense → Account → Account information.
2. Create two ad units in AdSense (Ads → By ad unit): a horizontal/leaderboard and
   a responsive in-article one.
3. In `site/config.js` set `client`, `slots.leaderboard`, `slots.inArticle`, then
   `enabled: true`.
4. Replace the placeholder publisher ID in `site/ads.txt` with the same ID.
5. Commit and deploy. `app.js` injects the AdSense loader and a properly configured
   `<ins class="adsbygoogle">` into each slot.

While `enabled` is `false` the slots render as visible dashed placeholders and
nothing is requested from Google — so no consent banner is required for testing.
Before enabling ads for UK/EU visitors, add a consent management platform and
review `ADSENSE_CONFIG.personalisedAds`.

If you would rather hard-code the ad units, the exact `<ins>` snippet is inside an
HTML comment next to each slot in `site/index.html`.

## Local development

```bash
cd site && python3 -m http.server 8080
# then open http://localhost:8080/?cat=length&from=m&to=ft&v=1
```

## Container

```bash
docker build -t measurement-conversions .
docker run --rm -p 8080:80 measurement-conversions
```

## URLs

State lives in the query string, so any conversion is shareable:
`/?cat=mass&from=kg&to=lb&v=80`

## Cloudflare notes

The site is fronted by the `RocWork` tunnel on the `daveys.xyz` zone, with a
proxied CNAME to `<tunnel-id>.cfargotunnel.com`. Two consequences:

- The origin leg is plain HTTP and Cloudflare terminates TLS, so the app's domain
  in Coolify is `http://convert.daveys.xyz`.
- **Rocket Loader is enabled zone-wide.** It rewrites `<script>` tags at the edge,
  which is a documented source of AdSense and analytics breakage, so every script
  here carries `data-cfasync="false"` (including the AdSense loader injected by
  `app.js`). Keep that attribute on any script you add. If ads misbehave even so,
  disable Rocket Loader for this hostname with a Configuration Rule in the
  Cloudflare dashboard.

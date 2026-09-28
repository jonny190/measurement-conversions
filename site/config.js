/* ---------------------------------------------------------------------------
 * Site configuration — this is the only file you need to touch to go live
 * with Google AdSense.
 *
 * To enable ads:
 *   1. Set `client` to your publisher ID (AdSense > Account > Account info),
 *      for example "ca-pub-1234567890123456".
 *   2. Set `slots.leaderboard` and `slots.inArticle` to the ad unit IDs you
 *      created in AdSense (AdSense > Ads > By ad unit).
 *   3. Set `enabled: true`.
 *   4. Replace the publisher ID in site/ads.txt as well.
 *
 * While `enabled` is false the page renders visible, labelled placeholders
 * instead of real ad units — nothing is requested from Google, and no cookie
 * or consent banner is needed.
 * ------------------------------------------------------------------------ */
window.SITE_CONFIG = {
  siteName: "Measurement Conversions",
  /* Optional: point at an analytics or privacy-policy URL shown in the footer. */
  privacyUrl: null,
};

window.ADSENSE_CONFIG = {
  enabled: false,
  client: "ca-pub-0000000000000000",
  slots: {
    leaderboard: "0000000000",
    inArticle: "0000000000",
  },
  /* Set true once a consent management platform is in place (UK/EU traffic). */
  personalisedAds: false,
};

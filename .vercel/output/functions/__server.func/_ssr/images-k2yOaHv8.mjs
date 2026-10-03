//#region node_modules/.nitro/vite/services/ssr/assets/images-k2yOaHv8.js
var hero_bakes_default = "/assets/hero-bakes-B2FF7Chb.jpg";
var hero_crafts_default = "/assets/hero-crafts-P1rOCue_.jpg";
var hero_mehendi_default = "/assets/hero-mehendi-D4Q8rgnK.jpg";
var cat_bakery_default = "/assets/cat-bakery-BPO7avLM.jpg";
var cat_crochet_default = "/assets/cat-crochet-Sm-Ih8lO.jpg";
var cat_bridal_default = "/assets/cat-bridal-0scyR__v.jpg";
var cat_artists_default = "/assets/cat-artists-OHS4WpB7.jpg";
var cat_boutiques_default = "/assets/cat-boutiques-C9J7A-Za.jpg";
var cat_decor_default = "/assets/cat-decor-B5rytMCT.jpg";
var cat_gifting_default = "/assets/cat-gifting-CqRvIJTH.jpg";
var heroImages = {
	mehendi: hero_mehendi_default,
	bakes: hero_bakes_default,
	crafts: hero_crafts_default
};
/** Category slug -> representative image. Swap for Drive URLs in production. */
var categoryImage = {
	"home-bakers": cat_bakery_default,
	mehendi: hero_mehendi_default,
	"makeup-bridal": cat_bridal_default,
	crochet: cat_crochet_default,
	artists: cat_artists_default,
	boutiques: cat_boutiques_default,
	"handmade-decor": cat_decor_default,
	gifting: cat_gifting_default
};
/**
* Keyword fallback so categories created in the sheet (e.g. "bakery",
* "bridal", "art") still get a relevant image instead of the generic one.
*/
var keywordImage = [
	[/bak|cake|dessert|choco/, cat_bakery_default],
	[/crochet|knit|yarn|amigurumi/, cat_crochet_default],
	[/bridal|makeup|wedding|muhurtham/, cat_bridal_default],
	[/mehendi|henna|maruthani/, hero_mehendi_default],
	[/art|paint|print|portrait/, cat_artists_default],
	[/boutique|saree|cloth|fashion|textile/, cat_boutiques_default],
	[/decor|handmade|terracotta|craft|pottery/, cat_decor_default],
	[/gift|hamper|return/, cat_gifting_default]
];
function imageForCategorySlug(slug) {
	if (!slug) return hero_crafts_default;
	const direct = categoryImage[slug];
	if (direct) return direct;
	const key = slug.toLowerCase();
	for (const [re, img] of keywordImage) if (re.test(key)) return img;
	return hero_crafts_default;
}
//#endregion
export { imageForCategorySlug as n, heroImages as t };

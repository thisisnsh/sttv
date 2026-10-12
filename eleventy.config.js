export default function (eleventyConfig) {
  const pathPrefix = normalizePrefix(process.env.PATH_PREFIX || "/");
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });
  eleventyConfig.addFilter("asset", (value) => `${pathPrefix}${value.replace(/^\//, "")}`);
  eleventyConfig.addFilter("absolute", (value, base) => new URL(`${pathPrefix}${value.replace(/^\//, "")}`, base).href);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("categories", (projects) => [...new Set(projects.map((project) => project.category))]);
  eleventyConfig.addGlobalData("pathPrefix", pathPrefix);
  eleventyConfig.addGlobalData("indexable", process.env.SITE_INDEXABLE === "true");
  eleventyConfig.addGlobalData("siteUrl", process.env.SITE_URL || "https://stolentribe.tv");
  eleventyConfig.addCollection("sitemap", (api) => api.getAll().filter((item) => item.url && !item.data.excludeFromSitemap && !item.data.noindex));
  return {
    pathPrefix,
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
}

function normalizePrefix(value) {
  return `/${value.split("/").filter(Boolean).join("/")}${value === "/" || !value.split("/").filter(Boolean).length ? "" : "/"}`;
}

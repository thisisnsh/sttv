export default {
  eleventyComputed: {
    title: (data) => data.project.title,
    description: (data) => data.project.summary,
    noindex: (data) => data.project.noindex !== false
  }
};

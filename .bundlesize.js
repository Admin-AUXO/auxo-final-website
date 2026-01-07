module.exports = {
  files: [
    {
      path: './dist/_astro/*.js',
      maxSize: '500 kB',
    },
    {
      path: './dist/_astro/*.css',
      maxSize: '100 kB',
    },
  ],
  ci: {
    githubBranch: 'main',
    repoToken: process.env.BUNDLESIZE_GITHUB_TOKEN,
    repoOwner: 'admin-auxo-group',
    repoName: 'auxo-final-website',
  },
};

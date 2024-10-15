const config = {
  tailwindjs: "./tailwind.config.js",
  port: 9050,
  purgecss: {
    content: ["./src/**/*.{html,js,php}"],
    safelist: {
      standard: [/^pre/, /^code/],
      greedy: [/token.*/],
    },
  },
};

// Base folder paths
const basePaths = ["src", "dist", "build"];

// Folder assets paths
const folders = ["css", "js", "img", "fonts", "third-party"];

const paths = {
  root: "./",
};

// Paths nesnesini oluştur
basePaths.forEach((base) => {
  paths[base] = {
    base: `./${base}`,
  };
  folders.forEach((folderName) => {
    const toCamelCase = folderName.replace(/\b-([a-z])/g, (_, c) =>
      c.toUpperCase()
    );
    paths[base][toCamelCase] = `./${base}/${folderName}`;
  });
});

// Export the configuration and paths
module.exports = {
  config,
  paths,
};

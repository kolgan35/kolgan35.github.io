let config = {
  mode: 'development',
  resolve: {
    modules: [
      "node_modules"
    ]
  },
  plugins: [],
  module: {
    rules: []
  }
};

// entry
config.entry = {
    main: [require('path').resolve(__dirname, "kotlin/imageviewer.mjs")]
};
config.output = {
    filename: (chunkData) => {
        return chunkData.chunk.name === 'main'
            ? "webApp.js"
            : "webApp-[name].js";
    },
    library: "webApp",
    libraryTarget: "umd",
    globalObject: "this"
};
    // source maps
    config.module.rules.push({
            test: /\.js$/,
            use: ["source-map-loader"],
            enforce: "pre"
    });
    config.devtool = 'eval-source-map';
config.ignoreWarnings = [/Failed to parse source map/]
    
// dev server
config.devServer = {
  "open": true,
  "static": [
    "kotlin",
    "../../../../webApp/build/processedResources/wasmJs/main",
    "/Users/artemkolganov/Documents/GitHub/kolgan35.github.io",
    "/Users/artemkolganov/Documents/GitHub/kolgan35.github.io/shared/",
    "/Users/artemkolganov/Documents/GitHub/kolgan35.github.io/nonAndroidMain/",
    "/Users/artemkolganov/Documents/GitHub/kolgan35.github.io/webApp/"
  ],
  "client": {
    "overlay": {
      "errors": true,
      "warnings": false
    }
  }
};

// Report progress to console
// noinspection JSUnnecessarySemicolon
;(function(config) {
    const webpack = require('webpack');
    const handler = (percentage, message, ...args) => {
        const p = percentage * 100;
        let msg = `${Math.trunc(p / 10)}${Math.trunc(p % 10)}% ${message} ${args.join(' ')}`;
        msg = msg.replace(require('path').resolve(__dirname, "../.."), '');;
        console.log(msg);
    };

    config.plugins.push(new webpack.ProgressPlugin(handler))
})(config);

// noinspection JSUnnecessarySemicolon
;(function(config) {
    const tcErrorPlugin = require('kotlin-test-js-runner/tc-log-error-webpack');
    config.plugins.push(new tcErrorPlugin())
    config.stats = config.stats || {}
    Object.assign(config.stats, config.stats, {
        warnings: false,
        errors: false
    })
})(config);

// cleanupSourcemap.js
// Replace paths unavailable during compilation with `null`, so they will not be shown in devtools
;
(() => {
    const fs = require("fs");
    const path = require("path");

    const outDir = __dirname + "/kotlin/"
    const projecName = path.basename(__dirname);
    const mapFileLegacy = outDir + projecName + ".map"
    const mapFile = outDir + projecName + ".wasm.map"

    let sourcemap
    try {
        sourcemap = JSON.parse(fs.readFileSync(mapFileLegacy))
    } catch (e) {
        sourcemap = JSON.parse(fs.readFileSync(mapFile))
    }
    const sources = sourcemap["sources"]
    srcLoop: for (let i in sources) {
        const srcFilePath = sources[i];
        if (srcFilePath == null) continue;

        const srcFileCandidates = [
            outDir + srcFilePath,
            outDir + srcFilePath.substring("../".length),
            outDir + "../" + srcFilePath,
        ];

        for (let srcFile of srcFileCandidates) {
            if (fs.existsSync(srcFile)) continue srcLoop;
        }

        sources[i] = null;
    }

    fs.writeFileSync(mapFile, JSON.stringify(sourcemap));
})();


config.experiments = {
    asyncWebAssembly: true,
    topLevelAwait: true,
}
module.exports = config

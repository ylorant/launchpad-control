module.exports = function override (config, env) {
    // FIXME: Those fallbacks are there to allow compilation with Webpack 5 even with Fermata's dependencies
    //        on some NodeJS base modules that aren't provided anymore as polyfills.
    config.resolve.fallback = {
        "https": false,
        "url": false,
        "http": false,
        "stream": false,
        "crypto": false
    };

    return config;
}
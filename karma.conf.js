module.exports = function(config) {
    config.set({
        frameworks: ["mocha"],

        files: [
            "./node_modules/unexpected/unexpected.js",
            "./node_modules/unexpected-sinon/lib/unexpected-sinon.js",
            "./node_modules/sinon/pkg/sinon.js",
            "./magicpen.js",
            "./test/common/browser.js",
            "./test/magicpen.spec.js"
        ],

        client: {
            mocha: {
                reporter: "html",
                timeout: 60000
            }
        },

        browserStack: {
            video: false,
            project:
                process.env.TRAVIS_BRANCH === "master" &&
                !process.env.TRAVIS_PULL_REQUEST_BRANCH // Catch Travis "PR" builds
                    ? "unexpected-sinon"
                    : "unexpected-sinon-dev"
        },

        browsers: ["ChromeHeadless"],

        reporters: ["dots"]
    });
};

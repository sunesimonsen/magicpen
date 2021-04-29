/*globals Deno*/
var isNode = !!(typeof process !== 'undefined' && process.versions && process.versions.node);

module.exports = (function () {
    if (typeof Deno !== 'undefined') {
        var env = {};
        try {
            env = Deno.env();
        } catch (err) {
          // Probably a permissions error because we don't have permission to read the environment variables
          // Unfortunately the whole permissions API is async now:
          // https://github.com/denoland/deno/pull/3200/files
          // ... so we can't detect whether we do have access
        }

        return {
            argv: Deno.args,
            color: !Deno.noColor ? 1 : 0,
            env: env,
            runtime: 'deno'
        };
    } else if (isNode) {
        var os;
        try {
            os = require("os");
        } catch (err) {
            // The environment is masquerading as node.js, but doesn't provide an os module.
            // Assume that we're actually in a browser
            // https://github.com/unexpectedjs/unexpected/issues/804#issue-870530110
            return {
                argv: [],
                env: {},
                runtime: "browser"
            };
        }

        return {
            argv: process.argv,
            env: process.env,
            runtime: 'node',
            getNodeRelease: os.release
        };
    } else {
        return {
            argv: [],
            env: {},
            runtime: 'browser'
        };
    }
})();

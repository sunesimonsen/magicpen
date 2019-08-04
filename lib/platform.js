module.exports = (function () {
    if (typeof Deno !== 'undefined') {
        var env = Deno.permissions().env ? Deno.env() : {};

        return {
            argv: Deno.args,
            color: !Deno.noColor ? 1 : 0,
            env: env,
            runtime: 'deno'
        };
    } else {
        var os = require('os');

        return {
            argv: process.argv,
            env: process.env,
            runtime: 'node',
            getNodeRelease: os.release
        };
    }
})();

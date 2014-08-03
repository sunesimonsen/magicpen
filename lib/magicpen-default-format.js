/*global namespace*/
(function () {

    function supportsColors() {
        // Copied from https://github.com/sindresorhus/supports-color/
        // License: https://raw.githubusercontent.com/sindresorhus/supports-color/master/license
        if (typeof process === 'undefined') {
            return false;
        }
        if (process.argv.indexOf('--no-color') !== -1) {
            return false;
        }

        if (process.argv.indexOf('--color') !== -1) {
            return true;
        }

        if (process.stdout && !process.stdout.isTTY) {
            return false;
        }

        if (process.platform === 'win32') {
            return true;
        }

        if ('COLORTERM' in process.env) {
            return true;
        }

        if (process.env.TERM === 'dumb') {
            return false;
        }

        if (/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(process.env.TERM)) {
            return true;
        }

        return false;
    }

    function defaultFormat() {
        if (typeof window !== 'undefined' || typeof window.navigator !== 'undefined') {
            return 'html'; // Browser
        } else if (supportsColors()) {
            return 'ansi'; // colored console
        } else {
            return 'text'; // Plain text
        }
    }

    namespace.defaultFormat = defaultFormat;
}());

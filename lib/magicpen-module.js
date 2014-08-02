/*global namespace*/
(function () {
    var global = this;
    var magicpen = namespace.magicpen;

    // Support three module loading scenarios
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
        // CommonJS/Node.js
        module.exports = magicpen;
    } else if (typeof define === 'function' && define.amd) {
        // AMD anonymous module
        define(function () {
            return magicpen;
        });
    } else {
        // No module loader (plain <script> tag) - put directly in global namespace
        global.weknowhow = global.weknowhow || {};
        global.weknowhow.magicpen = magicpen;
    }
}());

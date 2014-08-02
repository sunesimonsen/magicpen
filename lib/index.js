/*global console, __dirname, weknowhow, Uint8Array, Uint16Array*/
var Path = require('path'),
    fs = require('fs'),
    vm = require('vm'),
    context = vm.createContext({
        console: console,
        Buffer: Buffer,
        // Reuse the existing context's globals so instanceof checks work:
        Object: Object,
        Array: Array,
        Error: Error,
        RegExp: RegExp,
        Date: Date,
        String: String,
        Number: Number,
        Math: Math,
        Boolean: Boolean,
        Function: Function,
        Uint8Array: Uint8Array,
        Uint16Array: Uint16Array
    });

[
    'magicpen-namespace.js',
    'magicpen-es5-compatible.js',
    'magicpen-utils.js',
    'magicpen-core.js',
    'magicpen-text-serializer.js',
    'magicpen-ansi-serializer.js',
    'magicpen-html-serializer.js',
    'magicpen-module.js'
].forEach(function (fileName) {
    try {
        var src = fs.readFileSync(Path.resolve(__dirname, fileName), 'utf-8');
        vm.runInContext(src, context, fileName);
    } catch (err) {
        console.error('Error loading ' + fileName + ': ' + err.stack);
    }
});

module.exports = context.weknowhow.magicpen;

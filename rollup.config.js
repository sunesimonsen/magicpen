const fs = require('fs');
const path = require('path');

const commonjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const nodeGlobals = require('rollup-plugin-node-globals');

const plugins = [
    commonjs({ ignore: ['os'] }),
    nodeResolve({ preferBuiltins: true }),
    nodeGlobals()
];

const banner =
    '/*!\n' +
    fs
        .readFileSync(path.resolve(__dirname, 'LICENSE'), 'utf-8')
        .replace(/^/gm, ' * ')
        .replace(/\s+$/g, '') +
    '/\n';

module.exports = [
    {
        input: 'lib/MagicPen.js',
        output: {
            banner,
            file: 'magicpen.js',
            name: 'weknowhow.MagicPen',
            exports: 'default',
            format: 'umd',
            esModule: false,
            sourcemap: false,
            strict: false
        },
        plugins
    },
    {
        input: 'lib/MagicPen.js',
        output: {
            banner,
            file: 'magicpen.esm.js',
            exports: 'default',
            format: 'esm',
            sourcemap: true,
            strict: false
        },
        plugins
    }
];

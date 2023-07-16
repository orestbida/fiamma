import { defineConfig } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import pkg from './package.json' assert { type: "json"};

const productionMode = !process.env.ROLLUP_WATCH;

export const terserPlugin = terser({
    toplevel: true,
    format: {
        quote_style: 1,
        comments: /^!/
    },
    mangle: {
        properties: {
            regex: /^_/,
            reserved: ['__esModule'],
            keep_quoted: true
        }
    },
    compress: {
        drop_console: true,
        passes: 3,
    }
});

export default defineConfig(
    [
        {
            input: './src/index.js',
            output: [
                {
                    file: pkg.main,
                    format: 'umd',
                    name: 'Fiamma'
                },
                {
                    file: pkg.module,
                    format: "esm",
                    exports: "named"
                }
            ],
            plugins: [
                nodeResolve(),
                productionMode && terserPlugin,
            ]
        }
    ]
);
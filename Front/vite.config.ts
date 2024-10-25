import { defineConfig, normalizePath } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createHtmlPlugin } from 'vite-plugin-html'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

import { resolve } from 'path'

normalizePath(resolve(__dirname, 'src/lib'))
normalizePath(resolve(__dirname, 'src/misc'))
normalizePath(resolve(__dirname, 'src/assets'))
normalizePath(resolve(__dirname, 'src/components'))
normalizePath(resolve(__dirname, 'src/views'))
normalizePath(resolve(__dirname, 'src/store'))
normalizePath(resolve(__dirname, 'src/types'))
normalizePath(resolve(__dirname, 'src/routes'))
normalizePath(resolve(__dirname, 'src/runtime'))
normalizePath(resolve(__dirname, 'src/locales'))
normalizePath(resolve(__dirname, 'src'))
normalizePath(resolve(__dirname, './'))

const runtimeEnvScript = {
    data: {
        title: 'index',
        injectScript: '<script defer src="./env.js"></script>',
    },
}

const devEnvScript = {
    data: {
        title: 'index',
        injectScript: '<script type="module" src="src/runtime/env.ts"></script>',
    },
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
    const baseConfig = {
        plugins: [
            VueI18nPlugin({
                allowDynamic: true,
                include: [resolve(__dirname, 'src/locales/**')],
            }),
            vue({
                template: {
                    compilerOptions: {
                        isCustomElement: tag => tag.startsWith('ai-'),
                    },
                },
            }),
            createHtmlPlugin({
                minify: false,
                pages: [
                    {
                        /**
                         * If you want to store `index.html` in the specified folder, you can modify it, otherwise no configuration is required
                         * @default index.html
                         */
                        template: 'index.html',
                        filename: 'index.html',

                        /**
                         * Data that needs to be injected into the index.html ejs template
                         */
                        injectOptions: mode === 'development' ? devEnvScript : runtimeEnvScript,
                    },
                ],
            }),
        ],
        resolve: {
            alias: {
                lib: resolve(__dirname, 'src/lib'),
                misc: resolve(__dirname, 'src/misc'),
                assets: resolve(__dirname, 'src/assets'),
                components: resolve(__dirname, 'src/components'),
                views: resolve(__dirname, 'src/views'),
                store: resolve(__dirname, 'src/store'),
                types: resolve(__dirname, 'src/types'),
                routes: resolve(__dirname, 'src/routes'),
                runtime: resolve(__dirname, 'src/runtime'),
                src: resolve(__dirname, 'src'),
                '~@': resolve(__dirname, 'src'),
            },
        },
        server: {
            port: 8080,
        },
        test: {
            environment: 'jsdom',
            include: ['src/**/*.{test,spec}.{js,ts}'],
            coverage: {
                all: false,
                reporter: ['cobertura', 'text'],
            },
        },
    }

    if (command === 'serve') {
        return {
            ...baseConfig,
            base: '/',
        }
    } else {
        return {
            ...baseConfig,
            base: './',
        }
    }
})

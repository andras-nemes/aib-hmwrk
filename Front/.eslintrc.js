module.exports = {
    env: {
        amd: true,
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        '@vue/typescript',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier-vue/recommended',
        'plugin:vue/recommended',
    ],
    globals: {
        RUNTIME_ENV: true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        ecmaFeatures: {
            legacyDecorators: true,
            jsx: true,
        },
        ecmaVersion: 9,
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        indent: [
            'error',
            4,
            {
                SwitchCase: 1,
            },
        ],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                multiline: {
                    delimiter: 'none',
                    requireLast: true,
                },
            },
        ],
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                disallowTypeAnnotations: false,
            },
        ],
        '@typescript-eslint/no-unused-vars': [
            'warn',
            { vars: 'all', args: 'after-used', ignoreRestSiblings: false },
        ],
        // disable the rule for all files
        '@typescript-eslint/explicit-function-return-type': 'off',

        // Use rule from Typescript plugin
        'padding-line-between-statements': 'off',
        '@typescript-eslint/padding-line-between-statements': [
            'error',
            {
                blankLine: 'always',
                prev: [
                    'block',
                    'block-like',
                    'multiline-block-like',
                    'multiline-const',
                    'multiline-let',
                    'multiline-expression',
                    'interface',
                    'type',
                ],
                next: '*',
            },
        ],
        quotes: ['error', 'single', { avoidEscape: true }],
        semi: ['error', 'never'],
        'vue/html-indent': ['error', 4],
        'vue/html-self-closing': [
            'error',
            {
                html: {
                    void: 'never',
                    normal: 'always',
                    component: 'never',
                },
                svg: 'always',
                math: 'always',
            },
        ],
        'vue/max-attributes-per-line': [
            'error',
            {
                singleline: 1,
                multiline: 1,
            },
        ],
        'one-var': ['error', 'never'],
        'vue/custom-event-name-casing': [
            'error',
            'kebab-case',
            { ignores: ['/^[a-z]+(?:-[a-z]+)*:[a-z]+(?:-[a-z]+)*$/u'] },
        ],
        curly: 'error',
        'vue/padding-line-between-blocks': ['error', 'always'],
        'no-restricted-imports': [
            'error',
            {
                paths: ['src'],
                patterns: ['src/*', '!src/App.vue', '!src/main'],
            },
        ],
        'vue/singleline-html-element-content-newline': 'off',
        'keyword-spacing': 1, //  0 = off, 1 = warn, 2 = error
    },
    settings: {
        'prettier-vue': {
            SFCBlocks: {
                template: false,
            },
        },
    },
    overrides: [
        {
            // enable the rule specifically for TypeScript files
            files: ['*.ts', '*.tsx', '*.vue'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': [
                    'error',
                    {
                        allowExpressions: true,
                    },
                ],
            },
        },
    ],
}

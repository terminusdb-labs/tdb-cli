module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "standard-with-typescript",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "ignorePatterns": [
        ".eslintrc.cjs"
    ],
    "rules": {
        "@typescript-eslint/comma-dangle": ["error", "always-multiline"]
    }
}

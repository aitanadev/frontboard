module.exports = {
  "env": {
    "node": true,
    "browser": true,
    "es2021": true
  },
  "extends": [
    "standard",
    "plugin:vue/essential"
  ],
  "parser": "vue-eslint-parser",
  "parserOptions": {
    "parser": "@babel/eslint-parser",
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "plugins": [
    "vue"
  ],
  "rules": {
    "no-template-curly-in-string": 0,
    "no-prototype-builtins": 0,
    "array-callback-return": 0,
    "constructor-super": 0,
    "quote-props": 0,
    "array-bracket-spacing": 0,
    "space-before-function-paren": 0,
    "object-curly-spacing": 0,
    "indent": 0,
    "prefer-const": 0,
    "jest/no-disabled-tests": 0,
    "no-unused-vars": 0,
    "jest/no-test-prefixes": 0,
    "object-curly-newline": 0,
    "computed-property-spacing": 0,
    "vue/no-useless-template-attributes": 0,
    "vue/no-unused-components": 0,
    "vue/no-side-effects-in-computed-properties": 0,
    "vue/return-in-computed-property": 0,
    "vue/no-mutating-props": 0,
    "vue/multi-word-component-names": 0,
    "vue/require-valid-default-prop": 0,
    "vue/no-use-v-if-with-v-for": 0,
    "vue/require-v-for-key": 0,
    "vue/no-unused-vars": 0,
    "vue/valid-v-for": 0,
    "vue/no-unused-components": 0,
    "vue/no-parsing-error": 0,
    "vue/valid-next-tick": 0,
    "vue/require-prop-type-constructor": 0,
    'vue/valid-v-slot': ['error', {
      allowModifiers: true,
    }],
    "no-debugger": 0
  },
  "ignorePatterns": ["**/vendor/**"],
  "globals": {
  }
};

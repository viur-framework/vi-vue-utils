import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  // Vue plugin configurations (must come first)
  ...pluginVue.configs["flat/essential"], // Use essential instead of recommended to avoid formatting rules

  // Main configuration
  {
    // Language options with global variables
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },

    // Plugins
    plugins: {
      prettier: eslintPluginPrettier,
    },

    // Rules
    rules: {
      // Prettier integration - now uses .prettierrc
      "prettier/prettier": "error",

      // General rules
      "no-unused-vars": 1,

      // Vue specific rules
      "vue/order-in-components": 0,
      "vue/no-deprecated-slot-attribute": 0,
      "vue/multi-word-component-names": 1,
      "vue/component-definition-name-casing": 0,

      // Disable ALL Vue formatting/style rules
      "vue/html-closing-bracket-newline": "off",
      "vue/html-closing-bracket-spacing": "off",
      "vue/html-end-tags": "off",
      "vue/html-indent": "off",
      "vue/html-quotes": "off",
      "vue/html-self-closing": "off",
      "vue/max-attributes-per-line": "off",
      "vue/multiline-html-element-content-newline": "off",
      "vue/mustache-interpolation-spacing": "off",
      "vue/no-multi-spaces": "off",
      "vue/no-spaces-around-equal-signs-in-attribute": "off",
      "vue/prop-name-casing": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/v-bind-style": "off",
      "vue/v-on-style": "off",
      "vue/v-slot-style": "off",
      "vue/attributes-order": "off",
    },
  },

  // Prettier config to disable conflicting rules (must come last)
  eslintConfigPrettier,
];

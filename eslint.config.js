import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier  from "eslint-config-prettier";

export default [
  eslintConfigPrettier,
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      "vue/html-self-closing": 0,
      "no-unused-vars": 0,
      "vue/order-in-components": 0,
      "vue/no-deprecated-slot-attribute":0,
    }
  }
]

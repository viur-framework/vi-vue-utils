import vuePlugin from "eslint-plugin-vue";
import prettierPlugin from "eslint-plugin-prettier";
import {configs} from "eslint-plugin-vue";
import prettierConfig from "eslint-config-prettier"

let vueConfig = configs["vue3-recommended"]


export default [
  {
    vueConfig,
    prettierConfig,
    plugins: {
      vue: vuePlugin,
      prettier:prettierPlugin
    },
  rules: {
    "vue/html-self-closing": 0,
    "no-unused-vars": 1,
    "vue/order-in-components": 0,
    "vue/no-deprecated-slot-attribute":0,
  }
  }

]
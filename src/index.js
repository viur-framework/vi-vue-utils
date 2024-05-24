import { Request, HTTPError, getRequestStore } from "./request"
import { ListRequest, destroyStore } from "./requestlist"
import boneLogic from "./display/display"
import de_translations from "./translations/de"
import en_translations from "./translations/en"

export { Request, HTTPError, getRequestStore, ListRequest, destroyStore, de_translations, en_translations, boneLogic }

/*
*
* const packageInfo = require('vi-vue-utils/package.json');

console.log(`Using vi-vue-utils version ${packageInfo.version}`);
*
* */
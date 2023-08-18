<div align="center">
    <img src="https://github.com/viur-framework/viur-artwork/raw/main/icons/icon-vue.svg" height="196" alt="A hexagonal logo of the viur-cli" title="viur-cli">
    <h1>ViUR Vue Utils</h1>
    <a href="https://www.npmjs.com/package/@viur/viur-vue-utils">
        <img alt="Badge showing current NPM version" title="PyPI" src="https://img.shields.io/npm/v/@viur/viur-vue-utils">
    </a>
    <a href="LICENSE">
        <img src="https://img.shields.io/github/license/viur-framework/viur-vue-utils" alt="Badge displaying the license" title="License badge">
    </a>
    <br>
    A library for communication with the ViUR Core
</div>

## What does it do?
ViUR Vue Utils is a library to work with the Viur Framework


## Installation
```bash
$ npm i @viur/vue-utils
```

## Usage

```js
import {Request, ListRequest, destroyStore} from '@viur/vue-utils'

const simpleRequest = ref() //reactive variable
Request.get("https://jsonplaceholder.typicode.com/todos/1").then(async (resp: Response)=>{
    simpleRequest.value = await resp.json() //decode and set reactive variable
})


let userList = ListRequest(
    "teststore", // unqiue name of the Pinia store
    {url:"/user/list", params:{"limit":10}}
)

//fetches all users
userList.fetchAll().catch((e)=>{
    console.log(e)
    console.log(e.statusCode)
    console.log(e.statusText)
    console.log(e.response)
})

// if the results and the request is not needed anymore
destroyStore(userList)

```

## Dependencies

ViUR Vue Utils depends on

* [Vue](https://vuejs.org/)
* [Pinia](https://pinia.vuejs.org/)

## License

Copyright © 2023 by Mausbrand Informationssysteme GmbH.<br>
Mausbrand and ViUR are registered trademarks of Mausbrand Informationssysteme GmbH.

This project is free software under the MIT license.<br>
Please see the LICENSE file for details.

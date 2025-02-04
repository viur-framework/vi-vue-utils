import { defineStore } from "pinia"
import { reactive } from "vue"
import {destr} from 'destr'

class HTTPError extends Error {
  constructor(code, statusText, message, response) {
    super(message || statusText)
    if (arguments.length >= 4 && response) {
      Object.assign(this, response)
    }
    this.statusText = statusText
    this.statusCode = code
    this.response = response
  }
}

let useRequestStore = null

function getRequestStore() {
  if (!useRequestStore) {
    useRequestStore = defineStore("requestStore", () => {
      const state = reactive({
        sKeys: new Set(),
        amount:1,
      })
      function $reset() {
        state.sKeys = new Set()
      }
      return {
        state,
        $reset
      }
    })
  }
  return useRequestStore()
}


function cacheDeserializer(value, options){
  //convert keyToRequestMap back to a Map of Sets
  let deserialized =  destr(value,options)
  for (const [k,v] of Object.entries(deserialized['state']['keyToRequestMap'])){
    deserialized['state']['keyToRequestMap'][k] = new Set(v)
  }
  deserialized['state']['keyToRequestMap'] = new Map(Object.entries(deserialized['state']['keyToRequestMap']))
  return deserialized
}

function cacheSerializer(value, replacer){
  return JSON.stringify(value,(key, value) => {
    if (value instanceof Map) {
      return Object.fromEntries(value); // Convert Map to array
    }else if (value instanceof Set) {
      return Array.from(value); // Convert Set to array
    }
    return value
  })
}

export let useCachedRequestsStore = defineStore("cachedRequestsStore", () => {
  const state = reactive({
    cacheTime:1000 * 60 * 60 * 24 * 1,
    cachedRequests:{},
    keyToRequestMap:new Map()
  })

  function clearCache(prefix){
    for (const [k,v] of Object.entries(state.cachedRequests)){
      if (k.startsWith(prefix)){
        delete state.cachedRequests[k]
      }
    }
  }

  function $reset() {}
  return {
    state,
    clearCache,
    $reset
  }
},{
  persist: {
    debug:true,
    serializer: {
      deserialize: cacheDeserializer,
      serialize:cacheSerializer
    }
    
  }
})

let useCachedRequestsStoreInst = null
function getCachedRequestsStore() {
  if (!useCachedRequestsStoreInst) {
    useCachedRequestsStoreInst = useCachedRequestsStore()
    if(window.location.hostname === 'localhost'){
      useCachedRequestsStoreInst.state.cachedRequests = {}
    }
  }
  return useCachedRequestsStoreInst
}




export default class Request {
  static resetState() {
    getRequestStore().$reset()
    getRequestStore().$dispose()
  }

  static buildUrl(url) {
    if (url && !(url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//"))) {
      url = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : window.location.origin) + url
    }
    return url
  }

  static post(
    url,
    { dataObj = null, callback = null, failedCallback = null, abortController = null, headers = null, mode = null } = {}
  ) {
    function buildFormdata() {
      if (dataObj instanceof FormData) {
        return dataObj // we don't need to transform anything
      }

      const form = new FormData()
      for (const key in dataObj) {
        if (Array.isArray(dataObj[key])) {
          for (let item of dataObj[key]) {
            form.append(key, item)
          }
        } else {
          form.append(key, dataObj[key])
        }
      }
      return form
    }

    let reqPromise = cachedFetch.post(Request.buildUrl(url), buildFormdata(), null, headers, abortController, mode)

    reqPromise
      .then(function (response) {
        if (callback) {
          callback(response.data)
        }
      })
      .catch(function (error) {
        if (failedCallback) {
          failedCallback(error)
        }
      })

    return reqPromise
  }
  static async getBatchSkeys(renderer = import.meta.env.VITE_DEFAULT_RENDERER || "json") {
    await Request.get(`/${renderer}/skey`, {
      dataObj: { amount: getRequestStore().state.amount }
    }).then(async (resp) => {
      let data = await resp.json()
      if (!Array.isArray(data)) {
        data = [data]
      }
      getRequestStore().state.sKeys = new Set(data)
    })
  }
  static async securePost(
    url,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      abortController = null,
      renderer = import.meta.env.VITE_DEFAULT_RENDERER || "json",
      headers = null,
      mode = null,
      amount = null
    } = {}
  ) {
    let returnValue = null

    if (getRequestStore().state.sKeys.size === 0) {
      if (amount){
        getRequestStore().state.amount = amount
      }
      await Request.getBatchSkeys(renderer)
    }
    const sKey = [...getRequestStore().state.sKeys][0]

    if (dataObj instanceof FormData) {
      dataObj.append("skey", sKey)
      getRequestStore().state.sKeys.delete(sKey)
    } else {
      if (!dataObj) {
        dataObj = {}
      }
      dataObj["skey"] = sKey
      getRequestStore().state.sKeys.delete(sKey)
    }
    returnValue = Request.post(url, {
      dataObj: dataObj,
      callback: callback,
      abortController: abortController,
      headers,
      mode
    })

    return returnValue
  }

  static get(
    url,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      cached = false,
      clearCache = false,
      abortController = null,
      headers = null,
      mode = null,
      cacheTime = null
    } = {}
  ) {
    let reqPromise = cachedFetch.get(Request.buildUrl(url), dataObj, clearCache, headers, abortController, mode, cached, cacheTime)
    reqPromise
      .then(function (response) {
        if (callback) {
          callback(response.data)
        }
      })
      .catch(function (error) {
        if (failedCallback) {
          failedCallback(error)
        }
      })
    return reqPromise
  }

  static list(
    module,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      group = null,
      abortController = null,
      renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json",
      headers = null,
      cached = false,
      clearCache = false,
      cacheTime = null
    } = {}
  ) {
    let url = `/${renderer}/${module}/list`
    if (group) {
      url += `/${group}`
    }

    return Request.get(url, {
      dataObj: dataObj,
      callback: callback,
      failedCallback: failedCallback,
      abortController: abortController,
      headers:headers,
      cached:cached,
      cacheTime:cacheTime,
      clearCache:clearCache
    })
  }

  static getStructure(
    module,
    { dataObj = null,
      callback = null,
      failedCallback = null,
      group = null,
      abortController = null,
      renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json",
      headers = null,
      cached = false,
      clearCache = false,
      cacheTime = null
    } = {}
  ) {
    module = module.replace(/\//g, ".")
    let url = `/${renderer}/getStructure/${module}`
    if (group) {
      url += `/${group}`
    }

    return Request.get(url, {
      dataObj: dataObj,
      callback: callback,
      failedCallback: failedCallback,
      abortController: abortController,
      headers:headers,
      cached:cached,
      cacheTime:cacheTime,
      clearCache:clearCache
    })
  }

  static view(
    module,
    key,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      group = null,
      abortController = null,
      renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json",
      headers = null,
      cached = false,
      clearCache = false,
      cacheTime = null
    } = {}
  ) {
    let url = `/${renderer}/${module}/view/${key}`
    if (group) {
      url = `/${renderer}/${module}/view/${group}/${key}`
    }

    return Request.get(url, {
      dataObj: dataObj,
      callback: callback,
      failedCallback: failedCallback,
      abortController: abortController,
      headers:headers,
      cached:cached,
      cacheTime:cacheTime,
      clearCache:clearCache
    })
  }

  static add(
    module,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      group = null,
      abortController = null,
      renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json",
      headers = null,
    } = {}
  ) {
    let url = `/${renderer}/${module}/add`
    if (group) {
      url = `/${renderer}/${module}/add/${group}`
    }

    return Request.securePost(url, {
      dataObj: dataObj,
      callback: callback,
      failedCallback: failedCallback,
      abortController: abortController,
      headers:headers
    })
  }

  static edit(
    module,
    key,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      group = null,
      abortController = null,
      renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json",
      headers = null,
    } = {}
  ) {
    let url = `/${renderer}/${module}/edit/${key}`
    if (group) {
      url = `/${renderer}/${module}/edit/${group}/${key}`
    }

    return Request.securePost(url, {
      dataObj: dataObj,
      callback: callback,
      failedCallback: failedCallback,
      abortController: abortController,
      headers:headers
    })
  }

  static delete(
    module,
    key,
    {
      dataObj = null,
      callback = null,
      failedCallback = null,
      group = null,
      abortController = null,
      renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json",
      headers = null,
    } = {}
  ) {
    let url = `/${renderer}/${module}/delete/${key}`
    if (group) {
      url = `/${renderer}/${module}/delete/${group}/${key}`
    }

    return Request.securePost(url, {
      dataObj: dataObj,
      callback: callback,
      failedCallback: failedCallback,
      abortController: abortController,
      amount: 1,
      headers:headers
    })
  }

  static downloadUrlFor(bone, thumbnail = false) {
    if (bone && "dest" in bone) {
      if (thumbnail && "thumbnail" in bone["dest"]) {
        return Request.buildUrl(bone["dest"]["thumbnail"])
      } else if ("downloadUrl" in bone["dest"]) {
        return Request.buildUrl(bone["dest"]["downloadUrl"])
      }
      return Request.buildUrl(null)
    }

    return Request.buildUrl(bone)
  }

  static serveUrlFor(servingurl, size=null, filename=null, options="", download=false){
    const pattern = /^https:\/\/(.*?)\.googleusercontent\.com\/(.*?)$/;
    let newUrl = "/file/serve"

    const match = servingurl.match(pattern);

    if (match) {
      const host = match[1];
      const key = match[2];
      newUrl += `/${host}/${key}`

      if (size) {
        newUrl += `/${size}`
      }
      if (filename) {
        newUrl += `/${filename}`
      }
      let querylist = []
      for (const [key, value] of Object.entries({options: options, download: download})) {
        if (value) {
          querylist.push(`${key}=${value}`)
        }
      }
      if (querylist.length > 0) {
        newUrl += `?${querylist.join("&")}`
      }
    }

    return Request.buildUrl(newUrl)
  }

  static uploadFile(file, target = undefined, publicupload = false) {
    const filedata = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size.toString(),
      node: target
    }
    if (publicupload){
      filedata['public'] = true
    }
    return new Promise((resolve, reject) => {
      Request.securePost("/vi/file/getUploadURL", { dataObj: filedata })
        .then(async (resp) => {
          let uploadURLdata = await resp.json()
          fetch(uploadURLdata["values"]["uploadUrl"], {
            body: file,
            method: "POST",
            mode: "no-cors"
          })
            .then(async (uploadresp) => {
              const addData = {
                key: uploadURLdata["values"]["uploadKey"],
                skelType: "leaf"
              }
              Request.securePost("/vi/file/add", { dataObj: addData })
                .then(async (addresp) => {
                  let addData = await addresp.json()
                  if (addData["action"] === "addSuccess") {
                    resolve(addData["values"])
                  } else {
                    reject(addData)
                  }
                })
                .catch((error) => {
                  reject(error)
                })
            })
            .catch((error) => {
              reject(error)
            })
        })
        .catch((error) => {
          reject(error)
        })
    })
  }
}

// TODO CACHING LOGIC
class cachedFetch {
  withCredentials = true

  static buildOptions(method, body = null, headers = null, abortController = null, mode = null) {
    let options = { method: method }

    options["credentials"] = "include"
    options["headers"] = {
      Accept: "application/json, text/plain, */*"
    }
    if (headers) {
      options["headers"] = { ...options["headers"], ...headers }
    }

    if (body) {
      options["body"] = body
    }

    if (abortController) {
      options["signal"] = abortController.signal
    }

    if (mode) {
      options["mode"] = mode
    }

    return options
  }


  static async convertResponseToJson(response){
    return {
      body: await response.json(),
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      type: response.type,
      url: response.url,
      ok: response.ok,
      cached: response.cached
    }
  }

  static convertJsonToResponse(jsondata){
    let data = JSON.parse(jsondata)
    const stream = new ReadableStream({
      start(controller) {
          controller.enqueue(new TextEncoder().encode(JSON.stringify(data.body)));
          controller.close();
        }
    });
    delete data['body']
    return new Response(stream, data);
  }

  static get(url, params = null, clearCache = null, headers = null, abortController = null, mode = null, cached=false, cacheTime=null) {
    function buildGetUrl(url, params) {
      let requestUrl = new URL(url)
      if (params && Object.keys(params).length > 0) {
        const urlparams = new URLSearchParams()
        for (const [key, value] of Object.entries(params)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              urlparams.append(key, v)
            }
          } else {
            urlparams.append(key, value)
          }
        }

        requestUrl.search = urlparams.toString()
      }

      return requestUrl.toString()
    }

    let _url  = buildGetUrl(url, params)

    if (cached){
      let _cacheTime = cacheTime
      if (!_cacheTime){
        _cacheTime = getCachedRequestsStore().state.cacheTime
      }

      let cacheHit = getCachedRequestsStore().state.cachedRequests?.[_url]
      if (cacheHit ){
        if ( !clearCache && new Date() - cacheHit.date < _cacheTime){
          // cacheIsHot
          return new Promise((resolve) =>{
            let res = cachedFetch.convertJsonToResponse(cacheHit.response)
            res.cached = true
            resolve(res)
          })
        }else{
          delete getCachedRequestsStore().state.cachedRequests[_url]
        }
      }
      
      //cache is invalid, make a new Request
    }

    return fetch(buildGetUrl(url, params), cachedFetch.buildOptions("GET", null, headers, abortController, mode))
      .then(async (response) => {
        if (response.ok) {
          response.cached = false
          if ( cached ){
            let responsedata = await cachedFetch.convertResponseToJson(response.clone())
              let usedKeys = []

              let data = await response.clone().json()

            if (data instanceof Object && !Array.isArray(data) && data !== null){
              if (data['skellist']){

                usedKeys = data['skellist'].map(x=>x['key'])
                
                // create key to url references
                for(const k of usedKeys){
                  if (!getCachedRequestsStore().state.keyToRequestMap.has(k)){
                    getCachedRequestsStore().state.keyToRequestMap.set(k,new Set())
                  }
                  getCachedRequestsStore().state.keyToRequestMap.get(k).add(_url)
                }
              }else if (data['values']){
                usedKeys = [data['values']['key']]
                if (!getCachedRequestsStore().state.keyToRequestMap.has(usedKeys[0])){
                  getCachedRequestsStore().state.keyToRequestMap.set(k,new Set())
                }
                getCachedRequestsStore().state.keyToRequestMap.get(k).add(usedKeys[0])
              }
            }

            getCachedRequestsStore().state.cachedRequests[_url]={
              date:new Date(),
              response: JSON.stringify(responsedata),
              keys: usedKeys
            }

          }
          return response
        } else {
          const errorMessage = `${response.status} ${response.statusText}: ${
            response.headers ? response.headers.get("x-error-descr") : ""
          }`
          return Promise.reject(new HTTPError(response.status, response.statusText, errorMessage, response))
        }
      })
      .catch((error) => {
        if (error instanceof TypeError) {
          const errorMessage = `503 ${error.message}: ${error.headers ? error.headers.get("x-error-descr") : ""}`
          return Promise.reject(new HTTPError(503, error.message, errorMessage, error))
        }

        if ((error instanceof DOMException && error.name == "AbortError") || typeof(error) === 'string') {
          return Promise.reject(error)
        }

        const errorMessage = `${error.statusCode} ${error.statusText}: ${
          error.headers ? error.headers.get("x-error-descr") : ""
        }`
        return Promise.reject(new HTTPError(error.statusCode, error.statusText, errorMessage, error.response))
      })
  }

  static post(url, params = null, clearCache = null, headers = null, abortController = null, mode = null) {

    function checkPenultimateUrlPart(url, partName){
      if (!url.includes(partName)) return null

      let lastSlash = url.lastIndexOf("/");
      if (lastSlash === -1 || lastSlash === url.length - 1) return null
      return url.substring(lastSlash + 1)
    }

    let isAddRequest = false
    //clear caches if its a add, edit or delete post request
    if (['/delete',"/edit", "/add"].some(u => {
      return url.includes(u+"/") || url.endsWith(u)
    })){
      let hasExtraFields = false;
      for (const field of params.keys()) {
        if (field !== "key" && field !== "skey") {
          hasExtraFields = true
          break // Stop loop early to improve performance
        }
      }
      if (hasExtraFields){
        //only update cache if we have data in request
        //we got a url that ends on x or contains /x/
        let entryKey = null

        if (params?.key) {
          entryKey = params.key
        } else if (params instanceof FormData && params.has("key")){
          entryKey = params.get("key")
        } else{
          entryKey = ['/delete/',"/edit/", "/add/"].filter(u =>checkPenultimateUrlPart(url, u)).map(u =>checkPenultimateUrlPart(url, u))
          if (entryKey.length>0){
            entryKey = entryKey[0]
          }else{
            entryKey = null
          }
        }

        if (entryKey){
          if (getCachedRequestsStore().state.keyToRequestMap.has(entryKey)){
            let urlList = getCachedRequestsStore().state.keyToRequestMap.get(entryKey) // get urlList for this key

            for(const url of urlList){
              try{
                delete getCachedRequestsStore().state.cachedRequests[url] //delete all url caches for this key
              }catch(error){}

            }
            getCachedRequestsStore().state.keyToRequestMap.delete(entryKey) // delete the key to url map
          }
        }else{
          //was an add > no key
          isAddRequest = true
        }
      }
    }

    function getEntriesStartingWith(map, prefix) {
      return [...map].filter(([key]) => key.startsWith(prefix))
    }

    return fetch(url, cachedFetch.buildOptions("POST", params, headers, abortController, mode))
    .then(async (response) => {
      if (response.ok) {

        if(isAddRequest){
          // remove all urls that starts with the same url like the add
          let urlList = [...Object.keys(getCachedRequestsStore().state.cachedRequests)].filter((key) => key.startsWith(url.replace("/add","")))
          for(const url of urlList){
              try{
                delete getCachedRequestsStore().state.cachedRequests[url] //delete all url caches for this key
              }catch(error){}
          }
        }

        return response
      } else {
        const errorMessage = `${response.status} ${response.statusText}: ${
          response.headers ? response.headers.get("x-error-descr") : ""
        }`
        return Promise.reject(new HTTPError(response.status, response.statusText, errorMessage, response))
      }
    })
    .catch((error) => {
      if (error instanceof TypeError) {
        const errorMessage = `503 ${error.message}: ${error.headers ? error.headers.get("x-error-descr") : ""}`
        return Promise.reject(new HTTPError(503, error.message, errorMessage, error))
      }
      
      if ((error instanceof DOMException && error.name == "AbortError") || typeof(error) === 'string') {
        return Promise.reject(error)
      }

      const errorMessage = `${error.statusCode} ${error.statusText}: ${
        error.headers ? error.headers.get("x-error-descr") : ""
      }`
      return Promise.reject(new HTTPError(error.statusCode, error.statusText, errorMessage, error.response))
    })
  }

  static internalpost(url, params = null, clearCache = null, headers = null, abortController = null, mode = null) {
    return fetch(url, cachedFetch.buildOptions("POST", params, headers, abortController, mode))
  }
}

export { Request, HTTPError, getRequestStore }

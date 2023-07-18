import { defineStore } from "pinia";
import { reactive } from "vue";

class HTTPError extends Error {
  constructor(code, statusText, message, response) {
    super(message || statusText);
    if (arguments.length >= 4 && response) {
      Object.assign(this, response);
    }
    this.statusText = statusText;
    this.statusCode = code;
    this.response = response;
  }
}

let useRequestStore = null

function getRequestStore(){
  if (!useRequestStore){
    useRequestStore = defineStore("requestStore", () => {
      const state = reactive({ sKeys: new Set() });
      return {
        state,
      };
    });
  }
  return useRequestStore()
}

export default class Request {
  static resetState() {
    getRequestStore().$reset();
    getRequestStore().$dispose();
  }

  static buildUrl(url) {
    if (url && (!(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')))) {
      url = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : window.location.origin) + url
    }
    return url
  }

  static post(url, {dataObj = null, callback = null, failedCallback = null, abortController = null, headers=null, mode=null} = {}) {
    function buildFormdata() {
      if (dataObj instanceof FormData) {
        return dataObj // we don't need to transform anything
      }

      const form = new FormData()
      for (const key in dataObj) {
        if (Array.isArray(dataObj[key])) {
          for (let item of dataObj[key]) {
            form.append(key, item);
          }
        } else {
          form.append(key, dataObj[key]);
        }
      }
      return form
    }

    let reqPromise = cachedFetch.post(Request.buildUrl(url), buildFormdata(), null, headers, abortController, mode)

    reqPromise.then(function (response) {
      if (callback) {
        callback(response.data);
      }
    }).catch(function (error) {
      if (failedCallback) {
        failedCallback(error);
      }
    })

    return reqPromise
  }
  static async getBatchSkeys(amount = 30, renderer = import.meta.env.VITE_DEFAULT_RENDERER || "json") {
    await Request.get(`/${renderer}/skey`, {
      dataObj: { amount: amount },
    }).then(async (resp) => {
      let data = await resp.json();
      if(!Array.isArray(data)){
        data = [data]
      }
      getRequestStore().state.sKeys = new Set(data);
    });
  }
  static async securePost(url, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    abortController = null,
    renderer = import.meta.env.VITE_DEFAULT_RENDERER || "json",
    headers=null,
    mode=null,
    amount = 30
  } = {}) {
    let returnValue = null

    if (getRequestStore().state.sKeys.size === 0) {
      await Request.getBatchSkeys(amount)
    }
    const sKey = [ ...getRequestStore().state.sKeys ][ 0 ]

    if (dataObj instanceof FormData) {
      dataObj.append("skey", sKey)
      getRequestStore().state.sKeys.delete(sKey)
    } else {
      if (!dataObj) {
        dataObj = {}
      }
      dataObj[ "skey" ] = sKey
      getRequestStore().state.sKeys.delete(sKey)
    }
    returnValue = Request.post(url, { dataObj: dataObj, callback: callback, abortController: abortController, headers, mode })

    return returnValue
  }


  static get(url,
             {
               dataObj = null,
               callback = null,
               failedCallback = null,
               cached = false,
               clearCache = false,
               abortController = null,
               headers=null,
               mode=null,
               //          milli  sec  min  Std  Tage
               cacheTime = 1000 * 60 * 60 * 24 * 1
             } = {}
  ) {
    let reqPromise = cachedFetch.get(Request.buildUrl(url), dataObj, clearCache, headers, abortController, mode)
    reqPromise.then(function (response) {
      if (callback) {
        callback(response.data);
      }
    }).catch(function (error) {
      if (failedCallback) {
        failedCallback(error);
      }
    })
    return reqPromise

  }

  static list(module, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    group = null,
    abortController = null,
    renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json"
  } = {}) {
    let url = `/${renderer}/${module}/list`
    if (group) {
      url += `/${group}`
    }

    return Request.get(url,
      {
        dataObj: dataObj,
        callback: callback,
        failedCallback: failedCallback,
        abortController: abortController
      })
  }

  static getStructure(module, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    group = null,
    abortController = null,
  } = {}) {
    let url = `/vi/getStructure/${module}/`
    if (group) {
      url += `/${group}`
    }

    return Request.get(url,
      {
        dataObj: dataObj,
        callback: callback,
        failedCallback: failedCallback,
        abortController: abortController
      })
  }

  static view(module, key, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    group = null,
    abortController = null,
    renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json"
  } = {}) {
    let url = `/${renderer}/${module}/view/${key}`
    if (group) {
      url = `/${renderer}/${module}/view/${group}/${key}`
    }

    return Request.get(url,
      {
        dataObj: dataObj,
        callback: callback,
        failedCallback: failedCallback,
        abortController: abortController
      })
  }

  static add(module, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    group = null,
    abortController = null,
    renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json"
  } = {}) {
    let url = `/${renderer}/${module}/add`
    if (group) {
      url = `/${renderer}/${module}/add/${group}`
    }

    return Request.securePost(url,
      {
        dataObj: dataObj,
        callback: callback,
        failedCallback: failedCallback,
        abortController: abortController
      })
  }

  static edit(module, key, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    group = null,
    abortController = null,
    renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json"
  } = {}) {
    let url = `/${renderer}/${module}/edit/${key}`
    if (group) {
      url = `/${renderer}/${module}/edit/${group}/${key}`
    }

    return Request.securePost(url,
      {
        dataObj: dataObj,
        callback: callback,
        failedCallback: failedCallback,
        abortController: abortController
      })
  }

  static delete(module, key, {
    dataObj = null,
    callback = null,
    failedCallback = null,
    group = null,
    abortController = null,
    renderer = import.meta?.env?.VITE_DEFAULT_RENDERER || "json"
  } = {}) {
    let url = `/${renderer}/${module}/delete/${key}`
    if (group) {
      url = `/${renderer}/${module}/delete/${group}/${key}`
    }

    return Request.securePost(url,
      {
        dataObj: dataObj,
        callback: callback,
        failedCallback: failedCallback,
        abortController: abortController,
        amount: 1,
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

}

// TODO CACHING LOGIC
class cachedFetch {
  withCredentials = true

  static buildOptions(method, body = null, headers = null, abortController = null, mode=null) {
    let options = {method: method}

    options["credentials"] = 'include'
    options["headers"] = {
      Accept: "application/json, text/plain, */*",
    }
    if (headers) {
      options["headers"] = {...options["headers"], ...headers}
    }

    if (body) {
      options["body"] = body
    }

    if (abortController) {
      options["signal"] = abortController.signal
    }

    if (mode){
      options["mode"] = mode
    }

    return options
  }

  static get(url, params = null, clearCache = null, headers = null, abortController = null, mode=null) {
    function buildGetUrl(url, params) {
      let requestUrl = new URL(url)
      if (params && Object.keys(params).length > 0) {
        const urlparams = new URLSearchParams()
        for (const [key, value] of Object.entries(params)) {
          if (Array.isArray(value)) {
            for (const v of value) {
              urlparams.append(key, v);
            }
          } else {
            urlparams.append(key, value);
          }
        }

        requestUrl.search = urlparams.toString();
      }

      return requestUrl.toString()
    }

    return fetch(
      buildGetUrl(url, params),
      cachedFetch.buildOptions("GET", null, headers, abortController, mode))
      .then(async response => {
        if (response.ok) {
          return response
        } else {
          const errorMessage = `${response.status} ${response.statusText}: ${response.headers ? response.headers.get('x-error-descr') : ''}`
          return Promise.reject(new HTTPError(response.status, response.statusText, errorMessage, response))
        }
      }).catch((error) => {
        if (error instanceof TypeError) {
          const errorMessage = `503 ${error.message}: ${error.headers ? error.headers.get('x-error-descr') : ''}`
          return Promise.reject(new HTTPError(503, error.message, errorMessage, error))
        }
        if (error instanceof DOMException && error.name == "AbortError") {
            const errorMessage = `${error.code} ${error.name}: ${error.headers ? error.headers.get('x-error-descr') : ''}`
            return Promise.reject(new HTTPError(error.code, error.name, errorMessage, {"url":url}))
        }

        const errorMessage = `${error.statusCode} ${error.statusText}: ${error.headers ? error.headers.get('x-error-descr') : ''}`
        return Promise.reject(new HTTPError(error.statusCode, error.statusText, errorMessage, error.response))
      })
  }

  static post(url, params = null, clearCache = null, headers = null, abortController = null, mode=null) {
    return fetch(
      url,
      cachedFetch.buildOptions("POST", params, headers, abortController, mode)
    )
  }
}

export {
  Request,
  HTTPError,
  getRequestStore
}

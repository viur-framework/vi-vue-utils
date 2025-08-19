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

class ViURUploadAdapter {
  constructor(loader, api_url) {
    this.loader = loader
    this.api_url = api_url
  }

  async _getUploadUrl(file, reject) {
    const skeyResp = await fetch(this.api_url + "/vi/skey", { credentials: "include" }).catch((error) => {
      reject(error)
    })
    const skey = await skeyResp.json()

    const data = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size.toString(),
      skey: skey,
    }

    const uploadUrlResp = await fetch(buildGetUrl(this.api_url + "/vi/file/getUploadURL", data), {
      method: "POST",
      credentials: "include",
    }).catch((error) => {
      reject(error)
    })
    this.loader.uploaded = 10
    return uploadUrlResp
  }

  async fileUpload(file, uploadDetails, reject) {
    const uploadResp = await fetch(uploadDetails["values"]["uploadUrl"], {
      mode: "no-cors",
      method: "POST",
      body: file,
    }).catch((error) => {
      reject(error)
    })
    this.loader.uploaded = 50
    const skeyResp = await fetch(this.api_url + "/vi/skey", { credentials: "include" }).catch((error) => {
      reject(error)
    })
    const skey = await skeyResp.json()
    const data = {
      key: uploadDetails["values"]["uploadKey"],
      node: undefined,
      skelType: "leaf",
      skey: skey,
    }

    const fileAddResp = await fetch(buildGetUrl(this.api_url + "/vi/file/add", data), {
      method: "POST",
      credentials: "include",
    }).catch((error) => {
      reject(error)
    })
    this.loader.uploaded = 75
    return fileAddResp
  }

  async upload() {
    this.loader.uploadTotal = 100
    this.loader.uploaded = 0
    return this.loader.file.then(
      async (file) =>
        new Promise((resolve, reject) => {
          this._getUploadUrl(file, reject).then(async (uploadUrlResp) => {
            const uploadDetails = await uploadUrlResp.json()
            this.fileUpload(file, uploadDetails, reject).then(async (fileAddResp) => {
              const uploadedData = await fileAddResp.json()
              this.loader.uploaded = 100
              resolve({
                default: this.api_url + uploadedData["values"]["downloadUrl"],
              })
            })
          })
        })
    )
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort()
    }
  }
}

export function ViURUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
    return new ViURUploadAdapter(loader, editor.config.get("viur_api_url"))
  }
}

import Request from "../utils/request"
import Logics from "logics-js"
import { watch, inject, toRaw, reactive } from "vue"
import Utils from "../bones/utils"

export function useFormUtils(props, state) {
  function applyResponseState(data, { updateStructure = false } = {}) {
    state.datatype = data["datatype"] ?? null

    if (data["datatype"] === "list") {
      // List envelope: no form structure (it is `null`). Don't build a form —
      // expose the list for custom rendering via the `list` slot instead, and
      // never crash on the null structure a list carries.
      const items = data["data"] !== undefined ? data["data"] : data["skellist"]
      state.list = Array.isArray(items) ? items : []
      state.cursor = data["cursor"] ?? null
      state.orders = data["orders"] || []
      state.structure = {}
      state.skel = {}
    } else {
      // Entity: accept both the normalized v1 shape (`values`) and a raw
      // envelope-v2 body (`data`) — a cloned Response bypasses the .json()
      // normalization, so the body here may still carry `data` not `values`.
      const values = data["values"] !== undefined ? data["values"] : data["data"]
      if (updateStructure && data["structure"] != null) {
        initForm(values, data["structure"], state.values)
      } else if (values !== undefined) {
        state.skel = values
      }
      state.list = null
    }

    state.errors = data["errors"]
    state.actionparams = data["params"]
    state.actionname = data["action"]

    // Envelope-v2 multi-step fields. Absent on classic v1 bodies → reset to
    // null (harmless for single-step forms). `follow` becomes the POST target
    // for the *current* step; on a POST response it is the *next* step's URL.
    state.step = data["step"] ?? null
    state.stepStatus = data["step_status"] ?? null
    state.steps = data["steps"] ?? null
    state.status = data["status"] ?? null
    if (data["follow"] !== undefined) {
      state.postUrl = data["follow"]
    }
    state.loading = false
  }

  // GET-render a step of a follow-driven multi-step action. Unlike fetchData
  // (which POSTs — a submit), this renders the step's *initial* form.
  async function loadStep(url) {
    state.loading = true
    state.failed = null
    try {
      const resp = await Request.get(url)
      const data = await resp.clone().json()
      applyResponseState(data, { updateStructure: true })
      return data
    } catch (error) {
      state.failed = error
      state.loading = false
      throw error
    }
  }

  // Back one step in a multi-step flow. The target is the previous step's
  // **backend-provided** endpoint URL (`steps[prevKey].url` in the envelope) —
  // no client-side history. GET-rendering it prefills from the server session.
  // No-op on the first step or when the previous step carries no url.
  async function back() {
    if (!state.steps || !state.step) return
    const keys = Object.keys(state.steps)
    const idx = keys.indexOf(state.step)
    if (idx <= 0) return
    const prev = state.steps[keys[idx - 1]]
    const url = prev && (prev.url || prev.endpoint)
    if (!url) return
    return loadStep(url)
  }

  function buildRequestUrl() {
    //build Url from props
    let url = `/${props.renderer}/${props.module}/${props.action}`

    // add uses Key as parent, clone as source and edit as target
    const isTree = ["node", "leaf"].includes(props.skeltype)

    if (props.group) {
      url += `/${props.group}`
    } else if (isTree) {
      url += `/${props.skeltype}`
    }

    if (["edit", "clone"].includes(props.action) || (isTree && props.action === "add")) {
      url += `/${props.skelkey}`
    }

    return url
  }

  function normalizeStructure(structure) {
    //ensure that structure is a Object
    if (Array.isArray(structure)) {
      let struct = {}
      for (const idx in structure) {
        struct[structure[idx][0]] = structure[idx][1]
      }
      return struct
    } else {
      return structure
    }
  }

  function toFormData() {
    let formdata = []

    function handleEntry(result, currentFieldName, bone, val) {
      if (bone["type"].startsWith("record")) {
        let struct = normalizeStructure(bone["using"])
        for (const [_fieldname, _bone] of Object.entries(struct)) {
          result = result.concat(boneToForm(`${currentFieldName}.${_fieldname}`, _bone, val?.[_fieldname]))
        }
      } else if (val === Object(val) && bone["using"]) {
        //recusive call for nested data
        if (val["dest"]?.["key"]) {
          let struct = normalizeStructure(bone["using"])
          for (const [_fieldname, _bone] of Object.entries(struct)) {
            result = result.concat(boneToForm(`${currentFieldName}.${_fieldname}`, _bone, val["rel"]?.[_fieldname]))
          }
          result.push({ [`${currentFieldName}.key`]: val["dest"]["key"] })
        } else {
          result.push({ [`${currentFieldName}`]: null })
        }
      } else if (bone["type"].startsWith("spatial") && val) {
        //spatialbones
        result.push({ [currentFieldName + ".lat"]: val[0] })
        result.push({ [currentFieldName + ".lng"]: val[1] })
      } else if (bone["type"].startsWith("raw.json") && val) {
        result.push({ [currentFieldName]: JSON.stringify(val) })
      } else if (val === Object(val)) {
        //normal relations
        result.push({ [currentFieldName]: val["dest"]?.["key"] || null })
      } else {
        //everything else
        result.push({ [currentFieldName]: val })
      }
      return result
    }

    function boneToForm(fieldname, bone, value) {
      let result = []
      //only record and relational bones get indexed fields
      let indexBone = bone["type"].startsWith("record")
      let languages = bone["languages"] || ["none"]
      let languageValue = value
      for (const lang of languages) {
        let currentFieldName = fieldname
        if (lang !== "none") {
          currentFieldName += `.${lang}` //append lang
          if (languageValue) value = languageValue[lang]
        }

        if (bone["multiple"]) {
          if (!value) value = []
          for (const [idx, val] of value.entries()) {
            let currentFieldnameMultiple = currentFieldName

            if (indexBone || val?.["rel"] || (bone["using"] && val?.["rel"] !== null)) {
              currentFieldnameMultiple = `${currentFieldName}.${idx}` //append idx
            }
            result = handleEntry(result, currentFieldnameMultiple, bone, val)
          }
          if (value.length === 0) {
            result.push({ [currentFieldName]: null }) //send empty multiple fields
          }
        } else {
          result = handleEntry(result, currentFieldName, bone, value)
        }
      }
      return result
    }

    for (const [fieldname, bone] of Object.entries(state.structure)) {
      if (props.sendReadOnly) {
        formdata.push(boneToForm(fieldname, bone, state.skel[fieldname]))
      } else if (!state.structure[fieldname]["readonly"] || bone.type === "key") {
        formdata.push(boneToForm(fieldname, bone, state.skel[fieldname]))
      }
    }

    formdata = formdata.flat(10)
    return formdata
  }

  function sendData(alternativUrl = null, additionalData = null, headers = null, removeKeyFromDataset = true) {
    state.loading = true
    // No <form> element in list mode — nothing to validate.
    let isValid = state.viformelement ? state.viformelement.reportValidity() : true
    if (!isValid) {
      state.loading = false
      return new Promise((resolve, reject) => reject("Form is not valid"))
    }

    let request = Request.post
    if (props.secure) request = Request.securePost

    let url = buildRequestUrl()
    if (alternativUrl) url = alternativUrl //replace saving url

    const formData = new FormData()
    for (const bone of toFormData()) {
      for (const [k, v] of Object.entries(bone)) {
        let val = v
        if ([undefined, null].includes(v)) {
          val = ""
        }
        formData.append(k, val)
      }
    }

    let data = {}
    for (const key of formData.keys()) {
      if (key === "key" && removeKeyFromDataset) continue
      data[[key]] = formData.getAll(key)
    }
    if (additionalData) {
      data = { ...data, ...additionalData } //inject data like contexts
    }

    return request(url, { dataObj: data, headers: headers }).then(async (resp) => {
      let data = await resp.clone().json()
      applyResponseState(data, { updateStructure: data["structure"] !== undefined })
      return resp
    }).catch(async (error) => {
      if (error?.response) {
        try {
          const data = await error.response.clone().json()
          applyResponseState(data, { updateStructure: true })
        } catch {
          state.loading = false
        }
      } else {
        state.loading = false
      }
      state.failed = error
      throw error
    })
  }

  function fetchData(alternativUrl = null, additionalData = null, headers = null) {
    //fetch data
    state.loading = true
    let request = Request.post
    if (props.secure) request = Request.securePost

    let url = buildRequestUrl()
    if (alternativUrl) url = alternativUrl //replace saving url

    let data = {}
    if (additionalData) {
      data = { ...data, ...additionalData } //inject data like contexts
    }
    state.failed = null
    return request(url, { dataObj: data, headers: headers })
      .then(async (resp) => {
        let data = await resp.clone().json()
        initForm(data["values"], data["structure"], state.values)

        state.errors = data["errors"]
        state.actionparams = data["params"]
        state.actionname = data["action"]
        state.loading = false
        return resp
      })
      .catch(async (error) => {
        state.failed = error
        throw error
      })
  }

  function reload() {
    state.loading = true
    if (props.multistep && props.module && props.action) {
      // Follow-driven multi-step: GET-render the entry step. The submit chain
      // (POST → follow → GET next) is driven by ViForm via loadStep/sendData.
      loadStep(buildRequestUrl())
        .then(() => {
          state.loading = false
        })
        .catch(() => {
          state.loading = false
        })
    } else if (props.structure) {
      initForm(props.skel, props.structure, state.values)
      state.loading = false
    } else if (props.module && props.action) {
      fetchData(props.fetchUrl, props.params)
        .then(async (resp) => {
          state.loading = false
        })
        .catch(async (error) => {
          state.loading = false
        })
    } else {
      console.log(props)
      console.error("Error while building Form: you need atleast module and action or structure parameters")
    }
  }

  function updateCategories() {
    if (!state.structure) {
      state.structure = {}
    }

    let catname = state.categoryDefaultname
    if (!!catname && state.categoryDefaultname.includes("$(")) {
      catname = Utils.stripHtml(Utils.formatString(catname, state.skel, "Allgemein"))
    }

    let categories = { default: { name: catname, bones: [], visible: false, open: true } }

    for (const [boneName, bone] of Object.entries(state.structure)) {
      if (props.bones.length > 0) {
        if (!props.bones.includes(boneName)) {
          continue
        }
      }

      let category = "default"
      let boneStructure = state.structure[boneName]

      if (bone?.params?.category) {
        category = bone.params.category.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()
      }

      if (Object.keys(categories).includes(category)) {
        categories[category]["bones"].push({
          name: boneName,
        })
      } else {
        categories[category] = {
          name: bone.params.category,
          bones: [
            {
              name: boneName,
            },
          ],
        }
      }
      if (boneStructure["visible"] === true) {
        categories[category]["visible"] = true
      }

      if (
        (props.collapsedCategories &&
          props.collapsedCategories.map((x) => x.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()).includes(category)) ||
        category === "system" ||
        category === "internal" ||
        props.collapsedCategories?.[0] === "*"
      ) {
        categories[category]["open"] = false
      } else {
        categories[category]["open"] = true
      }
    }

    let sortedCategories = {}
    Object.keys(categories)
      .sort()
      .forEach(function (key) {
        sortedCategories[key] = categories[key]
      })

    return sortedCategories
  }

  function updateSkel(data) {
    const { name, lang, value, index, valid } = data
    state.valids[name] = valid

    let skelvalue = state.skel[name]
    if (value === undefined) return false
    if (state.readonly) return false

    if (lang) {
      if (!skelvalue) {
        skelvalue = {}
      }
      if (Object.keys(skelvalue).includes(lang) && index !== null) {
        if (!skelvalue[lang]) {
          skelvalue[lang] = []
        }
        skelvalue[lang][index] = value
      } else {
        skelvalue[lang] = value
      }
    } else if (index !== null) {
      if (!skelvalue) {
        skelvalue = []
      }
      skelvalue[index] = value
    } else {
      skelvalue = value
    }
    state.skel[name] = skelvalue
    logics() //postprocess all bones if needed
  }

  function _logics(structure, skel) {
    for (const [boneName, bone] of Object.entries(structure)) {
      if (bone?.["params"]?.["evaluate"]) {
        let ex = new Logics(bone?.["params"]?.["evaluate"])
        state.skel[boneName] = ex.run(skel).toString() //rule produces, valid results? multilang, multiple etc?
      }

      if (bone?.["params"]?.["visibleIf"]) {
        try {
          let ex = new Logics(bone?.["params"]?.["visibleIf"])
          bone["visible"] = ex.run(skel).toBool()
        } catch (error) {
          //console.log(bone?.["params"]?.["visibleIf"])
        }
      }

      if (bone?.["params"]?.["readonlyIf"]) {
        let ex = new Logics(bone?.["params"]?.["readonlyIf"])
        bone["readonly"] = ex.run(skel).toBool()
      }
      if (bone?.["params"]?.["requiredIf"]) {
        try {
          let ex = new Logics(bone?.["params"]?.["requiredIf"])
          bone["required"] = ex.run(skel).toBool()
        } catch (error) {
          //console.log(bone?.["params"]?.["requiredIf"])
        }
      }
      if (bone?.["using"]) {
        _logics(normalizeStructure(bone["using"]), skel)
      }
    }
  }

  function logics() {
    let skel = { ...state.skel, _skel: state.skel }

    if (props.internal) {
      // injet mainform with _skel
      skel = { ...skel, _skel: props.internal.skel }
    }
    _logics(state.structure, skel)
  }

  function initForm(skel, structure, values = {}) {
    let skeldata = skel || {}
    let formvalues = {}
    if (values) {
      formvalues = values
    }

    if (structure != null) {
      // != null guards against a null structure (e.g. a list envelope) — a
      // form is only (re)built from a real structure object.
      //props are refs to a js Object, removing reactivativ is not enought, we musst create copy of that object.
      //each form has its own structure and mutating dont change the structure for other forms, this is needed for multiple records with logics
      let struct = {}
      for (const [k, v] of Object.entries(normalizeStructure(structure))) {
        struct[k] = toRaw(v)
      }
      state.structure = structuredClone(struct)
    }

    state.skel = { ...skeldata, ...formvalues }

    state.categories = updateCategories()
  }

  return {
    fetchData,
    sendData,
    loadStep,
    back,
    buildRequestUrl,
    updateCategories,
    updateSkel,
    normalizeStructure,
    initForm,
    logics,
    reload,
  }
}

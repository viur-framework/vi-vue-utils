import Request from "../utils/request"
import Logics from "logics-js"
import { watch, inject, toRaw, reactive } from "vue"
import Utils from "../bones/utils"

export function useFormUtils(props, state) {
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
    let isValid = state.viformelement.reportValidity()
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
      state.skel = data["values"]
      //state.structure = normalizeStructure(data["structure"])
      state.errors = data["errors"]
      state.actionparams = data["params"]
      state.actionname = data["action"]
      state.loading = false
      return resp
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
    if (props.structure) {
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
      catname = Utils.stripHtml(Utils.formatString(catname, state.skel))
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

    if (structure !== undefined) {
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
    buildRequestUrl,
    updateCategories,
    updateSkel,
    normalizeStructure,
    initForm,
    logics,
    reload,
  }
}

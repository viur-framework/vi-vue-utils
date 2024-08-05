import Request from "../utils/request"
import {watch} from "vue"


export function useFormUtils(props,state){
  function buildRequestUrl(){
    //build Url from props
    let url = `/${props.renderer}/${props.module}/${props.action}`

    // add uses Key as parent, clone as source and edit as target
    const isTree = ["node","leaf"].includes(state.skeltype)


    if (props.group){
      url += `/${props.group}`
    }else if (isTree){
      url += `/${props.skeltype}`
    }

    if (["edit","clone"].includes(props.action) || (isTree && props.action === "add")){
      url += `/${props.skelkey}`
    }

    return url
  }

  function normalizeStructure(structure){
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

  function toFormData(){
    let formdata = []
    console.log(state.skel)

    function handleEntry(result, currentFieldName, bone, val){
      if (bone["type"].startsWith("record")){
        for (const [_fieldname, _bone] of Object.entries(bone["using"])) {
          result = result.concat(boneToForm(`${currentFieldName}.${_fieldname}`, _bone, val?.[_fieldname]))
        }
      } else if (val === Object(val) && bone["using"]) { //recusive call for nested data
        if (val["dest"]?.["key"]){
          for (const [_fieldname, _bone] of Object.entries(bone["using"])) {
            result = result.concat(boneToForm(`${currentFieldName}.${_fieldname}`, _bone, val["rel"]?.[_fieldname]))
          }
          result.push({[`${currentFieldName}.key`]: val["dest"]["key"]})
        }else{
          result.push({[`${currentFieldName}`]: null})
        }
      } else if (bone['type'].startsWith("spatial") && val){ //spatialbones
        result.push({[currentFieldName+".lat"]: val[0]})
        result.push({[currentFieldName+".lng"]: val[1]})
      } else if (val === Object(val)){ //normal relations
        result.push({[currentFieldName]:val["dest"]?.["key"]|| null})
      } else{ //everything else
        result.push({[currentFieldName]: val})
      }
      return result
    }

    function boneToForm(fieldname,bone,value){
      let result = []
      //only record and relational bones get indexed fields
      let indexBone = bone["type"].startsWith("record")
      let languages = bone["languages"] || ["none"]
      let languageValue = value
      for(const lang of languages){
        let currentFieldName = fieldname
        if(lang!=="none"){
          currentFieldName += `.${lang}` //append lang
          if (languageValue) value = languageValue[lang]
        }

        if (bone["multiple"]){
          if (!value) value=[]
          for(const [idx,val] of value.entries()){
            let currentFieldnameMultiple = currentFieldName
            if (indexBone || val?.["rel"]){ //indexbones and relations with relSkel use idx
              currentFieldnameMultiple = `${currentFieldName}.${idx}`//append idx
            }
            console.log(val)
            result = handleEntry(result, currentFieldnameMultiple, bone, val)
          }
          if (value.length===0){
            result.push({[currentFieldName]: null}) //send empty multiple fields
          }
        }else{
          result = handleEntry(result, currentFieldName, bone, value)
        }
      }
      //console.log("Z")
      return result
    }

    for (const [fieldname, bone] of Object.entries(state.structure)){
      if(props.sendReadOnly){
        formdata.push(boneToForm(fieldname, bone, state.skel[fieldname]))
      }else if (!state.structure[fieldname]["readonly"]){
        formdata.push(boneToForm(fieldname, bone, state.skel[fieldname]))
      }

    }

    formdata = formdata.flat(10)


    console.log(formdata)
    return formdata
  }


  function sendData(alternativUrl= null,additionalData= null,removeKeyFromDataset= true){
    state.loading = true
    let request = Request.post
    if (props.secure) request = Request.securePost

    let url = buildRequestUrl()
    if (alternativUrl) url = alternativUrl //replace saving url

    const formData = new FormData()
    for (const bone of toFormData()) {
      for (const [k, v] of Object.entries(bone)) {
        let val = v || ""
        formData.append(k, val)
      }
    }

    let data = {}
    for (const key of formData.keys()) {
      if (key==="key" && removeKeyFromDataset) continue
      data[[key]] = formData.getAll(key)
    }
    if (additionalData){
      data = {...data, ...additionalData} //inject data like contexts
    }

    return request(url, {dataObj: data}).then(async (resp)=>{
      let data = await resp.clone().json()
      state.skel = data["values"]
      //state.structure = normalizeStructure(data["structure"])
      state.errors = data["errors"]
      state.loading = false
      return resp
    })
  }

  function fetchData(){
    //fetch data
    state.loading = true
    let request = Request.post
    if (props.secure) request = Request.securePost

    const url = buildRequestUrl()
    const data = {}

    return request(url, {dataObj: data}).then(async (resp)=>{
      let data = await resp.clone().json()
      state.skel = data["values"]
      state.structure = normalizeStructure(data["structure"])
      state.errors = data["errors"]
      state.loading = false
      return resp
    })
  }

  function updateCategories(){
    if (!state.structure){
      state.structure = {}
    }

    let categories = { default: { name: "Allgemein", bones: [], visible: false, open: true } }

    for (const [boneName, bone] of Object.entries(state.structure)) {
      if (props.bones.length > 0) {
        if (!props.bones.includes(boneName)) {
          continue
        }
      }

      let category = "default"
      let boneStructure = state.structure[boneName]

      if (bone?.params?.category) {
        category = bone.params.category.toLowerCase()
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
            }
          ]
        }
      }
      if (boneStructure["visible"] === true) {
        categories[category]["visible"] = true
      }


      if (
        ( props.collapsedCategories &&
          props.collapsedCategories.map((x) => x.toLowerCase()).includes(category)) ||
          props.collapsedCategories === "system" ||
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

  function updateSkel(data){
    const {name, lang, value, index} = data
    let skelvalue = state.skel[name]
    if (value === undefined) return false
    if (state.readonly) return false

    if (lang) {
      if (!skelvalue){
        skelvalue = {}
      }
      if (Object.keys(skelvalue).includes(lang) && index !== null) {
        skelvalue[lang][index] = value
      } else {
        skelvalue[lang] = value
      }
    } else if (index !== null) {
      skelvalue[index] = value
    } else {
      skelvalue = value
      state.skel[name] = skelvalue
    }
    if (name ==="bone_recordbonemultiple"){
      console.log(state.skel[name])
    }

    logics() //postprocess all bones if needed
  }

  function logics() {
    for (const [boneName, bone] of Object.entries(state.structure)) {
      if (bone?.["params"]?.["evaluate"]) {
        let ex = new Logics(bone?.["params"]?.["evaluate"])
        state.skel[boneName] = ex.run(state.skel) //rule produces, valid results? multilang, multiple etc?
      }

      if (bone?.["params"]?.["visibleIf"]) {
        let ex = new Logics(bone?.["params"]?.["visibleIf"])
        bone["visible"] = ex.run(state.skel).toBool()
      }

      if (bone?.["params"]?.["readonlyIf"]) {
        let ex = new Logics(bone?.["params"]?.["readonlyIf"])
        bone["readonly"] = ex.run(state.skel).toBool()
      }
    }
  }

  watch(()=>state.structure, (newVal, oldVal)=>{
    if (newVal !== oldVal){
      state.categories = updateCategories()
    }
  })

  return {
    fetchData,
    sendData,
    buildRequestUrl,
    updateCategories,
    updateSkel
  }
}

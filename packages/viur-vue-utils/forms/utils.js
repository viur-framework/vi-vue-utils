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


    function boneToForm(fieldname,bone,value){
      let result = []
      //only record and relational bones get indexed fields
      let indexBone = bone["type"].startsWith("record")



      let values = {"none":value}
      if (bone['languages']){
        values = value
      }
      let languages = bone["languages"] || ["none"]
      for(const lang of languages){
        let currentFieldName = fieldname
        if(lang!=="none"){
          currentFieldName += `.${lang}`
          if (value) value = value[lang]
        }
        console.log(bone)
        console.log(value)

        if (bone["multiple"]){
          if (!value) value=[]
          for(const [idx,val] of value.entries()){
            if (indexBone || val?.["rel"]){
              currentFieldName += `.${idx}`
            }

            if (val === Object(val) && bone["using"]){
              for (const [_fieldname, _bone] of Object.entries(bone["using"])){
                result = result.concat(boneToForm(`${currentFieldName}.${_fieldname}`, _bone,val["rel"][_fieldname]))
              }
              result.push({[`${currentFieldName}.key`]:val["dest"]["key"]})
            } else if (val === Object(val)){
              result.push({[currentFieldName]:val["dest"]["key"]})
            } else{
              result.push({[currentFieldName]: val})
            }
          }
        }else{
          if (value === Object(value) && bone["using"]){
            for (const [_fieldname, _bone] of Object.entries(bone["using"])){
              result = result.concat(boneToForm(`${currentFieldName}.${_fieldname}`, _bone, value["rel"][_fieldname]))
            }
            result.push({[`${currentFieldName}.key`]:value["dest"]["key"]})
          } else if (value === Object(value)){
            result.push({[currentFieldName]:value["dest"]["key"]})
          }else{
            result.push({[currentFieldName]: value})
          }
        }
      }
      return result
    }

    for (const [fieldname, bone] of Object.entries(state.structure)){
      formdata.push(boneToForm(fieldname, bone, state.skel[fieldname]))
    }
    formdata = formdata.flat(10)
    return formdata
  }


  function sendData(){

  }

  function fetchData(){
    //fetch data
    state.loading = true
    let request = Request.post
    if (props.secure) request = Request.securePost

    const url = buildRequestUrl()
    const data = {}

    request(url, {dataObj: data}).then(async (resp)=>{
      let data = await resp.json()

      state.skel = data["values"]
      state.structure = normalizeStructure(data["structure"])
      state.errors = data["errors"]
      state.loading = false
      console.log(data)
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
    console.log("GGG")
    console.log(toFormData())
    const {name, lang, val, index} = data

    let skelvalue = state.skel[name]

    if (val === undefined) return false
    if (state.readonly) return false

    if (lang) {
      if (!skelvalue){
        skelvalue = {}
      }
      if (Object.keys(skelvalue).includes(lang) && index !== null) {
        skelvalue[lang][index] = val
      } else {
        skelvalue[lang] = val
      }
    } else if (index !== null) {
      skelvalue[index] = val
    } else {
      skelvalue = val
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

import Utils from "../utils"
import { computed, reactive } from "vue"

export const languageMap = [
  { lang: "en", country: "US", label: "English", flag: "\ud83c\uddfa\ud83c\uddf8" },
  { lang: "de", country: "DE", label: "Deutsch", flag: "\ud83c\udde9\ud83c\uddea" },
  { lang: "ch", country: "CH", label: "Schweiz", flag: "\ud83c\udde8\ud83c\udded" },
  { lang: "fr", country: "FR", label: "Français", flag: "\ud83c\uddeb\ud83c\uddf7" },
  { lang: "es", country: "ES", label: "Español", flag: "\ud83c\uddea\ud83c\uddf8" },
  { lang: "pt", country: "BR", label: "Português", flag: "\ud83c\udde7\ud83c\uddf7" },
  { lang: "it", country: "IT", label: "Italiano", flag: "\ud83c\uddee\ud83c\uddf9" },
  { lang: "nl", country: "NL", label: "Nederlands", flag: "\ud83c\uddf3\ud83c\uddf1" },
  { lang: "pl", country: "PL", label: "Polski", flag: "\ud83c\uddf5\ud83c\uddf1" },
  { lang: "ru", country: "RU", label: "Русский", flag: "\ud83c\uddf7\ud83c\uddfa" },
  { lang: "tr", country: "TR", label: "Türkçe", flag: "\ud83c\uddf9\ud83c\uddf7" },
  { lang: "zh", country: "CN", label: "中文", flag: "\ud83c\udde8\ud83c\uddf3" },
  { lang: "ja", country: "JP", label: "日本語", flag: "\ud83c\uddef\ud83c\uddf5" },
  { lang: "ko", country: "KR", label: "한국어", flag: "\ud83c\uddf0\ud83c\uddf7" },
  { lang: "ar", country: "SA", label: "العربية", flag: "\ud83c\uddf8\ud83c\udde6" },
  { lang: "hi", country: "IN", label: "हिन्दी", flag: "\ud83c\uddee\ud83c\uddf3" },
  { lang: "sv", country: "SE", label: "Svenska", flag: "\ud83c\uddf8\ud83c\uddea" },
  { lang: "no", country: "NO", label: "Norsk", flag: "\ud83c\uddf3\ud83c\uddf4" },
  { lang: "da", country: "DK", label: "Dansk", flag: "\ud83c\udde9\ud83c\uddf0" },
  { lang: "fi", country: "FI", label: "Suomi", flag: "\ud83c\uddeb\ud83c\uddee" },
  { lang: "cs", country: "CZ", label: "Čeština", flag: "\ud83c\udde8\ud83c\uddff" },
]

const boneLogic = (skel, structure, showflags = false, selectedLang = null, t = null) => {
  let bones_state = reactive({
    skel: computed(() => {
      if (skel && skel.constructor.name === "RefImpl") {
        return skel.value
      }
      return skel
    }),
    structure: computed(() => {
      if (structure.constructor.name === "RefImpl") {
        return structure.value
      }
      return structure
    }),
  })

  function getBoneValue(boneName, options = null, skel = null) {
    if (skel === null) {
      skel = bones_state.skel
    }
    if (skel === null) {
      return "-"
    }
    if (Utils.objectEmpty(skel) || Utils.objectEmpty(bones_state.structure)) {
      return "-"
    }
    let languages = hasLanguages(boneName)
    if (languages) {
      let values = []

      for (let lang of languages) {
        if (isMultiple(boneName)) {
          if (selectedLang) {
            if (selectedLang === lang) {
              values.push(langPrefix(lang, renderMultipleValue(boneName, options, skel, lang)))
            }
          } else {
            values.push(langPrefix(lang, renderMultipleValue(boneName, options, skel, lang)))
          }
        } else {
          if (selectedLang) {
            if (selectedLang === lang) {
              values.push(langPrefix(lang, renderSingleValue(boneName, options, null, skel, lang)))
            }
          } else {
            values.push(langPrefix(lang, renderSingleValue(boneName, options, null, skel, lang)))
          }
        }
      }
      return values.join(", ")
    } else {
      if (isMultiple(boneName)) {
        return renderMultipleValue(boneName, options, skel, null)
      } else {
        return renderSingleValue(boneName, options, null, skel, null)
      }
    }
  }

  function hasLanguages(boneName) {
    return bones_state.structure[boneName] && bones_state.structure[boneName]["languages"]
      ? bones_state.structure[boneName]["languages"]
      : false
  }

  function isMultiple(boneName) {
    return bones_state.structure[boneName] && bones_state.structure[boneName]["multiple"]
      ? !!bones_state.structure[boneName]["multiple"]
      : false
  }

  function langPrefix(lang, value) {
    if (showflags) {
      const entry = languageMap.find(({ lang: l }) => l === lang)
      if (entry) {
        value = `${entry.flag} ${value}`
      }
    }
    return value
  }

  function renderSingleValue(boneName, options, value = null, skel = null, lang = null) {
    let boneStructure = bones_state.structure[boneName]
    if (boneStructure == null) {
      return "-"
    }
    if (!boneStructure["multiple"]) {
      if (skel === null) {
        skel = bones_state.skel
      }
      value = skel[boneName]
      if (lang) {
        value = skel[boneName][lang]
      }
    }

    if (value === "" || value === null || value === undefined || !boneStructure) {
      return "-"
    } else if (boneStructure["type"] === "select" || boneStructure["type"].startsWith("select.")) {
      // extract description from tuple
      if (boneStructure["values"].length > 0) {
        let returnValue = boneStructure["values"]?.filter((x) => x[0].toString() === value.toString())?.[0]?.[1]
        return returnValue ? returnValue : "-"
      }
      if (Object.keys(boneStructure["values"]).length > 0) {
        let returnValue = Object.entries(boneStructure["values"])?.filter(
          (x) => x[0].toString() === value.toString()
        )?.[0]?.[1]
        return returnValue ? returnValue : "-"
      }

      return "-"
    } else if (boneStructure["type"] === "date" || boneStructure["type"].startsWith("date.")) {
      if (options && options === "time") {
        return new Date(value).toLocaleTimeString()
      } else if (options && options === "date") {
        return new Date(value).toLocaleDateString()
      }
      return new Date(value).toLocaleString()
    } else if (boneStructure["type"] === "relational" || boneStructure["type"].startsWith("relational.")) {
      return Utils.formatString(boneStructure["format"], { ...value, lang: lang })
    } else if (boneStructure["type"] === "hierarchy" || boneStructure["type"].startsWith("hierarchy.")) {
      return Utils.formatString(boneStructure["format"], { ...value, lang: lang })
    } else if (boneStructure["type"] === "record" || boneStructure["type"].startsWith("record.")) {
      if (boneStructure["format"]?.includes("$(dest.")) {
        return Utils.formatString(boneStructure["format"], { dest: value, lang: lang })
      }
      return Utils.formatString(boneStructure["format"], { ...value, lang: lang })
    } else if (boneStructure["type"] === "bool") {
      if (typeof t === "function") {
        return value ? t("bones.bool.true") : t("bones.bool.false")
      }
      return value ? "Ja" : "Nein"
    } else if (boneStructure["type"] === "raw.json") {
      return JSON.stringify(value)
    } else {
      value = Utils.unescape(value)
      return value.toString()
    }
  }

  function renderMultipleValue(boneName, options, skel = null, lang = null) {
    if (skel === null) {
      skel = bones_state.skel
    }

    let value = skel[boneName]

    if (lang) {
      value = skel[boneName][lang]
    }

    if (value && value.length > 0) {
      return value
        .map((x) => {
          if (selectedLang) {
            if (selectedLang === lang) {
              return renderSingleValue(boneName, options, x, skel, lang)
            }
          } else {
            return renderSingleValue(boneName, options, x, skel, lang)
          }
        })
        .join(", ")
    }
    return "-"
  }

  return {
    getBoneValue,
    bones_state,
  }
}

export default boneLogic

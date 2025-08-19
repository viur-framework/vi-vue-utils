export default class Utils {
  static objectEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
  }

  static getDescr(bone, value) {
    try {
      return bone["values"].filter((option) => option[0] === value)[0][1]
    } catch (e) {
      return "-"
    }
  }

  static unescape(value) {
    if (!value) value = ""
    return String(value)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#40;/g, "(")
      .replace(/&#41;/g, ")")
      .replace(/&#61;/g, "=")
      .replace(/&#039;/g, "'")
      .replace(/&#040;/g, "(")
      .replace(/&#041;/g, ")")
      .replace(/&#061;/g, "=")
  }

  static formatString(formatstr, boneValue) {
    function getpathListFromFormatstring(formatstr) {
      let output = []
      let formatList = []
      let regstr = /\$\((.*?)\)/g

      while (formatList) {
        formatList = regstr.exec(formatstr)
        if (!formatList) {
          formatList = false
          continue
        }

        output.push(formatList[1])
      }

      return output
    }

    function readValue(pathstr, avalue) {
      let path = pathstr.split(".")
      let restPath = pathstr.split(".")
      let aval = avalue
      for (let entry of path) {
        restPath.shift()
        if (aval && aval !== "-" && Object.keys(aval).includes(entry)) {
          if (Array.isArray(aval[entry])) {
            let resVal = []
            for (let val of aval[entry]) {
              resVal.push(readValue(restPath.join("."), val))
            }
            aval = resVal.join(", ")
          } else {
            aval = readValue(restPath.join("."), aval[entry])
          }

          if (typeof aval === "object" && !Array.isArray(aval) && aval !== null) {
            aval = Object.entries(aval)
              .map((x) => x[1])
              .join(", ")
          }
        } else if (!aval || (typeof aval[entry] === "object" && !aval[entry])) {
          aval = "-"
        }
      }
      return aval
    }

    let pathlist = getpathListFromFormatstring(formatstr)

    let finalStrList = []

    if (!Array.isArray(boneValue)) {
      boneValue = [boneValue]
    }

    for (let avalue of boneValue) {
      let finalstr = formatstr
      for (let pathstr of pathlist) {
        let aval = readValue(pathstr, avalue)
        aval = Utils.unescape(aval)
        finalstr = finalstr.replace("$(" + pathstr + ")", aval)
      }
      finalStrList.push(finalstr)
    }
    return finalStrList.join(", ")
  }
}

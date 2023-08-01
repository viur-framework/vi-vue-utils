export default class Utils {
  static objectEmpty(obj: object) {
    return Object.keys(obj).length === 0 && obj.constructor === Object
  }

  static getDescr(bone: Object, value: any) {
    try {
      //@ts-ignore
      return bone["values"].filter((option) => option[0] === value)[0][1]
    } catch (e) {
      return "-"
    }
  }

  static formatString(formatstr: string, boneValue: object | Array<object>) {
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

    let pathlist = getpathListFromFormatstring(formatstr)

    let finalStrList = []
    if (!Array.isArray(boneValue)) {
      boneValue = [boneValue]
    }
    for (let avalue of boneValue) {
      let finalstr = formatstr
      for (let pathstr of pathlist) {
        let path = pathstr.split(".")
        let aval = avalue
        for (let entry of path) {
          if (aval && aval !== "-" && entry in aval && aval[entry]) {
            aval = aval[entry]
          } else {
            aval = "-"
          }
        }
        finalstr = finalstr.replace("$(" + pathstr + ")", aval)
      }
      finalStrList.push(finalstr)
    }

    return finalStrList.join(", ")
  }
}

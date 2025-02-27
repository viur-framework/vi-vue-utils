import {useI18n} from 'vue-i18n'
import Request from './request'


export function useTranslations(i18n=null) {
  // If no i18n instance is provided, use the default i18n instance
  if (!i18n){
    i18n = useI18n()
  }
  

  /**
   * Updates the locale messages for the specified locale in the i18n instance.
   * 
   * This function allows you to merge new translation messages with the existing ones
   * for a given locale. If the `override` parameter is set to true, the existing 
   * messages will be replaced by the new messages instead of being merged.
   *
   * @param {string} locale - The locale code (e.g., 'en', 'fr', 'es') for which
   *                          the messages should be updated.
   * @param {Object} messages - An object containing the new translation messages 
   *                            to be added or used for the specified locale.
   * @param {boolean} [override=false] - If set to true, the existing messages 
   *                                      will be overridden instead of merged.
   */
  function updateLocaleMessages(locale,messages, override=false){
    if (!override){
      let oldmessages  = i18n.messages.value?.[locale]
      if(!oldmessages){
        oldmessages = {}
      }
      messages = {...oldmessages, ...messages}
    }
    i18n.setLocaleMessage(locale, messages)
  }


  /**
   * Cleans up a translation string by normalizing special characters.
   * This is needed because vue-i18n and viur use different formats.
   *
   * This function performs the following transformations on the input string:
   * 1. Replaces all occurrences of '{{' with '{'.
   * 2. Replaces all occurrences of '}}' with '}'.
   * 3. Replaces any occurrence of the characters '$', '@', or '|' with a string
   *    that formats them as escaped single-quoted strings (e.g., '$' becomes 
   *    '{\'$\'}, '@' becomes '{\'@\'}, and '|' becomes '{'|''}).
   */
  function cleanTranslation(value){
    return value
            .replaceAll('{{', '{')
            .replaceAll('}}', '}')
            .replace(/([@$|])/g, '{\'$1\'}')
  }
  


  /**
   * Fetch translations for specified languages from core.
   * 
   * The function retrieves translations for a given set of languages, potentially filtered by a 
   * translation pattern. It formats the received data and updates the locale messages for each 
   * specified language.
   *
   * @async
   * @function fetchTranslations
   * @param {string[]} [languages=["de"]] - An array of language codes for which translations are to be fetched. Default is an array with "de".
   * @param {string|null} [pattern=null] - An optional pattern to filter the translations retrieved. If not provided, all translations will be retrieved.
   * @param {string} [url="/json/_translation/get_public"] - The URL endpoint for fetching translations. Default is set to "/json/_translation/get_public".
   * @returns {Promise<Object>} - A promise that resolves to an object containing translations for the specified languages, with each language code as keys and their corresponding translations as values.
   * 
   * @throws {Error} - Logs an error in the console if the fetching process fails, indicating no translation was received from the server.
   */
  async function fetchTranslations(languages=["de"],pattern=null, url="/json/_translation/get_public"){
    if (!Array.isArray(languages)){
      languages = [languages]
    }

    let retVal = languages.reduce((acc,item)=>{acc[item]={}; return acc;},{})

    try {
      let dataObj = {languages:languages}
      if(pattern){
        dataObj['pattern'] = pattern
      }
  
      let translations = await Request.get(url,{dataObj:dataObj,cached:true})
      const data = await translations.json()
      for (let country in data) {
        retVal[country] = Object.fromEntries(
          Object.entries(data[country]).map(
              ([key, value]) => [key, cleanTranslation(value)],
          ),
        )
      }

      for (const lang of languages){
        updateLocaleMessages(lang,retVal[lang])
      }
      
    }catch(error){
      throw new Error('Error while building translations')
    }
    return retVal
  }

  return {
    updateLocaleMessages,
    fetchTranslations,
    cleanTranslation
  }
}








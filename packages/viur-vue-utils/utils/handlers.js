import Request from './request';
import {defineStore} from 'pinia'
import {reactive, computed, toRaw} from "vue";

/**
 *
 * @param id Name of the Store
 * @param module modulename. Is used to build a /json/{module}/list url
 * @param params filterobject
 * @param url a url to fetch from, overrides module url building
 */
export function ListRequest(id, {module = "", params = {}, url = ""} = {}) {

    const useList = defineStore(id, () => {
        const abortController = new AbortController()

        const state = reactive({
            skellist: [], // holds our entries
            structure: {}, // raw skelstructure
            cursor: "", // last cursor
            request_state: null,
            params: params, //request params
            state: 0, // 0:not fetched, 1:fetched, 2:all fetched, -1:error
        })

        /**
         *  Convert skelstructure to a key:value object
         * @type object
         */
        const structure = computed(() => {
            let struct = {}
            if (state.structure) {
                for (let idx in state.structure) {
                    struct[state.structure[idx][0]] = toRaw(state.structure[idx][1])
                }
            }
            return struct
        })

        /**
         * Fetch
         * @returns {number|Promise<Response>}
         */
        function fetch(do_reset = true) {
            if (do_reset) reset()
            if (state.state === 2) return 0

            let request = Request.list
            let firstparameter = module
            if (url !== "") {
                request = Request.get
                firstparameter = url
            }
            return request(firstparameter, {
                dataObj: state.params,
                abortController: abortController.signal
            }).then(async (resp) => {
                let data = await resp.json()

                state.request_status = parseInt(resp.status)
                state.cursor = data["cursor"]

                state.skellist = state.skellist.concat(data["skellist"])

                if (Object.keys(state.structure).length === 0 && state.structure.constructor === Object) {
                    state.structure = data["structure"]
                }
                if (data["skellist"].length === 0 || !state.cursor) {
                    state.state = 2
                } else {
                    state.state = 1
                }

            }).catch((error) => {
                state.request_status = parseInt(error.response.status)
                state.state = -1
            })
        }

        /**
         * fetch all Entries till cursor ends
         * WARNING dont do this with large lists
         */
        function fetchAll(do_reset = true) {
            if (do_reset) reset()

            try {
                next().then((resp) => {
                    fetchAll(false)
                })
            } catch (e) {//next() can return 0
            }
        }

        /**
         * fetch the next set with a given cursor
         * @returns {number|Promise<Response>}
         */
        function next() {
            if (state.state === 2) {
                return 0 //nothing to do
            }

            if (state.cursor !== "") {
                state.params = {...state.params, "cursor": state.cursor}
            }
            return fetch(false)
        }

        /**
         * cancel possible running request and reset the state
         */
        function reset() {
            abortController.abort()
            state.structure = {}
            state.skellist = []
            state.skellist.length = 0
            state.cursor = ""
            state.state = 0
        }

        /**
         * reset, update the filter and fetch the first set
         * @param params
         * @returns {number|Promise<Response>}
         */
        function filter(params) {
            state.params = params
            return fetch()
        }


        return {
            state,
            structure,

            fetchAll,
            fetch,
            next,
            filter
        }
    })
    return useList()
}

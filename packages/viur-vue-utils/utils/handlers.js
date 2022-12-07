import {Request, HTTPError} from './request.js';
import {defineStore} from 'pinia'
import {reactive, computed, toRaw} from "vue";

/**
 *
 * @param id Name of the Store
 * @param module modulename. Is used to build a /json/{module}/list url
 * @param params filterobject
 * @param url a url to fetch from, overrides module url building
 */
export function ListRequest(id, {module = "", params = {}, group = null, url = ""} = {}) {

	const useList = defineStore(id, () => {
		const abortController = new AbortController()

		const state = reactive({
			skellist: [], // holds our entries
			structure: {}, // raw skelstructure
			cursor: "", // last cursor
			request_state: null,
			orders: [],
			params: params, //request params
			group: group,
			module: module,
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
			let firstparameter = state.module
			if (url !== "") {
				request = Request.get
				firstparameter = url
			}
			return request(firstparameter, {
				dataObj: state.params,
				abortController: abortController.signal,
				group: state.group
			}).then(async (resp) => {
				let data = await resp.json()

				state.request_state = parseInt(resp.status)
				state.cursor = data["cursor"]
				state.orders = data["orders"] || []

				state.skellist = state.skellist.concat(data["skellist"])

				if (Object.keys(state.structure).length === 0) {
					const structure = await Request.getStructure(state.module)
						.then(structureResponse => structureResponse.json().then(_structure => _structure));
					state.structure = structure["viewSkel"];
				}
				if (data["skellist"].length === 0 || !state.cursor) {
					state.state = 2
				} else {
					state.state = 1
				}

			}).catch((error) => {
				if (error.response) {
					state.request_state = parseInt(error.response.status)
				} else {
					state.request_state = 501
				}

				state.state = -1
				throw error
			})
		}

		/**
		 * fetch all Entries till cursor ends
		 * WARNING dont do this with large lists
		 */
		function fetchAll(do_reset = true) {
			if (do_reset) reset()
			let nextRequest = next()
			if (nextRequest === 0) {
				return 0
			}
			return nextRequest.then((resp) => {
				fetchAll(false)
			})

		}

		/**
		 * fetch the next set with a given cursor
		 * @returns {number|Promise<Response>}
		 */
		function next() {
			if (state.state === 2 || state.state === -1) {
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
			if (Object.keys(state.params).includes("cursor")) {
				delete state.params.cursor
			}
			state.state = 0
			state.request_state = null
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
			filter,
			reset
		}
	})
	return useList()
}

export function destroyStore(store) {
	store.reset()
	store.$dispose()
}

/**
 *
 * @param id Name of the Store
 * @param module modulename. Is used to build a /json/{module}/list url
 * @param params filterobject
 * @param group group
 * @param url a url to fetch from, overrides module url building
 */
export function ListRequest(
  id: string,
  {
    module,
    params,
    group,
    url,
  }?: {
    module?: string
    params?: {}
    group?: string
    url?: string
  }
): import("pinia").Store<
  any,
  import("pinia")._UnwrapAll<
    Pick<
      {
        state: {
          skellist: object[]
          structure: {}
          cursor: string
          request_state: number | null
          params: {}
          group: string
          module: string
          state: number
        }
        structure: object
        fetchAll: (do_reset?: boolean) => void
        fetch: (do_reset?: boolean) => number | Promise<Response>
        next: () => number | Promise<Response>
        filter: (params: object) => number | Promise<Response>
      },
      "state" | "structure"
    >
  >,
  Pick<
    {
      state: {
        skellist: object[]
        structure: {}
        cursor: string
        request_state: number | null
        params: {}
        group: string
        state: number
      }
      structure: object
      fetchAll: (do_reset?: boolean) => void
      fetch: (do_reset?: boolean) => number | Promise<Response>
      next: () => number | Promise<Response>
      filter: (params: object) => number | Promise<Response>
    },
    "structure"
  >,
  Pick<
    {
      state: {
        skellist: object[]
        structure: {}
        cursor: string
        request_state: number | null
        params: {}
        group: string
        state: number
      }
      structure: object
      fetchAll: (do_reset?: boolean) => Promise<any>
      fetch: (do_reset?: boolean) => number | Promise<Response>
      next: () => number | Promise<Response>
      filter: (params: object) => number | Promise<Response>
    },
    "filter" | "next" | "fetch" | "structure" | "reset" | "fetchAll"
  >
>

export function destroyStore(store: import("pinia").Store): void

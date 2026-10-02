export default class Request {
  static buildUrl(url: string): string

  static post(
    url: string,
    {
      dataObj,
      callback,
      failedCallback,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static securePost(
    url: string,
    {
      dataObj,
      callback,
      failedCallback,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static get(
    url: string,
    {
      dataObj,
      callback,
      failedCallback,
      cached,
      clearCache,
      abortController,
      cacheTime,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      cached?: boolean
      clearCache?: boolean
      abortController?: AbortSignal
      cacheTime?: number
    }
  ): Promise<Response>

  static list(
    module: string,
    {
      dataObj,
      callback,
      failedCallback,
      group,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      group?: string
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static view(
    module: string,
    key: string,
    {
      dataObj,
      callback,
      failedCallback,
      group,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      group?: string
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static add(
    module: string,
    {
      dataObj,
      callback,
      failedCallback,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      group?: string
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static edit(
    module: string,
    key: string,
    {
      dataObj,
      callback,
      failedCallback,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      group?: string
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static delete(
    module: string,
    key: string,
    {
      dataObj,
      callback,
      failedCallback,
      abortController,
    }?: {
      dataObj?: object
      callback?: Function
      failedCallback?: Function
      group?: string
      abortController?: AbortSignal
    }
  ): Promise<Response>

  static downloadUrlFor(bone: object, thumbnail?: boolean): string
}

/**
 * Normalize a viur-actions envelope-v2 response body back to the classic v1
 * shape (`values` / `skellist` / `structure` / `errors` / `action`). v1 bodies,
 * arrays and non-objects pass through unchanged. Applied transparently to every
 * response this library returns; exported for consumers that parse responses
 * themselves.
 */
export function normalizeEnvelope<T = any>(data: T): T

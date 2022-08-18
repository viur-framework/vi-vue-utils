export default class Request {
    static buildUrl(url: string): string;
    static post(url: string, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        abortController?: AbortController;
    }): Promise<Response>;
    static securePost(url: string, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        abortController?: AbortController
    }): Promise<Response>;
    static get(url: string, { dataObj, callback, failedCallback, cached, clearCache, abortController, cacheTime }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        cached?: boolean;
        clearCache?: boolean;
        abortController?: AbortController;
        cacheTime?: number;
    }): Promise<Response>;
    static list(module: string, { dataObj, callback, failedCallback, group, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        group?: string;
        abortController?: AbortController;
    }): Promise<Response>;
    static view(module: string, key: string, { dataObj, callback, failedCallback, group, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        group?: string;
        abortController?: AbortController;
    }): Promise<Response>;
    static add(module: string, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        abortController?: AbortController;
    }): Promise<Response>;
    static edit(module: string, key: string, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        abortController?: AbortController;
    }): Promise<Response>;
    static delete(module: string, key: string, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: object;
        callback?: Function;
        failedCallback?: Function;
        abortController?: AbortController;
    }): Promise<Response>;
    static downloadUrlFor(bone: object, thumbnail?: boolean): string;
}

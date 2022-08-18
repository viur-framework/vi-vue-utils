export default class Request {
    static buildUrl(url: any): any;
    static post(url: any, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        abortController?: any;
    }): Promise<Response>;
    static securePost(url: any, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        abortController?: any;
    }): Promise<any>;
    static get(url: any, { dataObj, callback, failedCallback, cached, clearCache, abortController, cacheTime }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        cached?: boolean;
        clearCache?: boolean;
        abortController?: any;
        cacheTime?: number;
    }): Promise<any>;
    static list(module: any, { dataObj, callback, failedCallback, group, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        group?: any;
        abortController?: any;
    }): Promise<any>;
    static view(module: any, key: any, { dataObj, callback, failedCallback, group, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        group?: any;
        abortController?: any;
    }): Promise<any>;
    static add(module: any, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        abortController?: any;
    }): Promise<any>;
    static edit(module: any, key: any, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        abortController?: any;
    }): Promise<any>;
    static delete(module: any, key: any, { dataObj, callback, failedCallback, abortController }?: {
        dataObj?: any;
        callback?: any;
        failedCallback?: any;
        abortController?: any;
    }): Promise<any>;
    static downloadUrlFor(bone: any, thumbnail?: boolean): any;
}

import {B30RetModel, BaseRetData, BindData, SlstRecords, UserRecords} from "./models.ts";


export const apiEndpoint = import.meta.env.VITE_API_ENDPOINT


export async function fetchAPI(path: string, method: string, body?: any, headers?: any, contentType: string | null = "application/json"): Promise<Response> {
    const baseHeaders: { [key: string]: any } = {
        "Authorization": `${localStorage.getItem("arc_token")}`,
    }
    if (contentType) {
        baseHeaders["Content-Type"] = contentType
    }
    let reqHeaders: any
    if (headers) {
        reqHeaders = {...baseHeaders, ...headers}
    }
    else {
        reqHeaders = baseHeaders
    }
    return new Promise((resolve, reject) => {
        fetch(`${apiEndpoint}/${path}`, {
            method,
            credentials: "include",
            headers: reqHeaders,
            body: contentType === "application/json" ? (body ? JSON.stringify(body) : undefined) : body,
        })
            .then((v) => resolve(v))
            .catch((e) => reject(e))
    })
}


export async function apiRegister(userName: string, password: string, captchaToken: string): Promise<BaseRetData> {
    const resp = await fetchAPI("arcweb/register", "POST", {
        username: userName,
        password: password
    }, {"captcha-token": captchaToken})
    return resp.json()
}


export async function apiChangePassword(password: string): Promise<BaseRetData> {
    const resp = await fetchAPI("arcweb/change_password", "POST", {
        password: password
    })
    return resp.json()
}


export async function apiLogin(userName: string, password: string, captchaToken: string): Promise<BaseRetData> {
    const resp = await fetchAPI("arcweb/login", "POST", {
        username: userName,
        password: password
    }, {"captcha-token": captchaToken})
    return resp.json()
}

export async function apiGetIsLogin(): Promise<BaseRetData> {
    const resp = await fetchAPI("arcweb/get_is_login", "GET")
    return resp.json()
}

export async function apiGetIsBind(): Promise<BindData> {
    const resp = await fetchAPI("arcweb/get_is_bind", "GET")
    return resp.json()
}

export async function apiGetAllRecords(): Promise<UserRecords> {
    const resp = await fetchAPI("arcweb/get_all_bests", "GET")
    return resp.json()
}

export async function apiGetSlst(): Promise<SlstRecords> {
    const resp = await fetchAPI("arcweb/get_slst", "GET")
    return resp.json()
}

export async function apiUpdateModifiedB30(newB30: B30RetModel[]): Promise<BaseRetData> {
    const resp = await fetchAPI("arcweb/update_modified_b30", "POST", newB30)
    return resp.json()
}

export function imageResURLFmt(sid: string, size: number = 200, difficulty: number = 2) {
    // return `${apiEndpoint}/arcweb/webassets/song_cover/${sid}?difficulty=${difficulty}&size=${size}&auth=${localStorage.getItem("token")}`
    return `${apiEndpoint}/arcweb/webassets/song_cover/${sid}.jpg?difficulty=${difficulty}&size=${size}`
}


export async function apiBind(userName: string, password: string, isUploadCookie: boolean, captchaToken: string): Promise<BaseRetData> {
    const resp = await fetchAPI("arcweb/bind_arc_account", "POST", {
        username: userName,
        password: password,
        isUploadCookie: isUploadCookie
    }, {"captcha-token": captchaToken})
    return resp.json()
}


export async function apiUploadSt3(st3File: File): Promise<BaseRetData> {
    const formdata = new FormData();
    formdata.append("st3", st3File)
    const resp = await fetchAPI("arcweb/upload_st3", "POST", formdata, undefined, null)
    return resp.json()
}


export async function apiBindOauth(req_type: string, bind_data: string): Promise<BaseRetData> {
    const resp = await fetchAPI(`arcweb/oauth_bind?req_type=${req_type}`, "POST", bind_data, undefined, "text/plain")
    return resp.json()
}


export async function apiUnbindOauth(req_type: string): Promise<BaseRetData> {
    const resp = await fetchAPI(`arcweb/oauth_unbind?req_type=${req_type}`, "POST")
    return resp.json()
}

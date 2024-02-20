
export interface BaseRetData {
    success: boolean,
    message: string
}

interface IKeyString {
    [key: string]: any;
}

export interface B30RetModel extends IKeyString{
    "best_clear_type": number,
    "character": number,
    "clear_type": number,
    "difficulty": number,
    "health": number,
    "is_char_uncapped": boolean,
    "is_skill_sealed": boolean,
    "miss_count": number,
    "modifier": number,
    "name": string,
    "near_count": number,
    "perfect_count": number,
    "rank": number,
    "score": number,
    "shiny_perfect_count": number,
    "song_id": string,
    "time_played": number,  // 13位时间戳
    "user_id": number
}

export interface MeData {
    success: boolean
    value: {
        character: number
        name: string
        user_code: string
        user_id: number
        rating: number
        // recent_score: any
    }
}

export interface MeRet {
    data: MeData
    name: string,
    usercode: string,
    userid: number
}

export interface UserRecordsData {
    b30?: {
        data: B30RetModel[],
        userid: number
    }  // 可null
    // cookie?: any  // 可null
    me?: MeRet
    modified_b30?: B30RetModel[]
}

export interface UserRecords extends BaseRetData{
    data?: UserRecordsData
}

export interface SongDisplay extends B30RetModel {
    songName: string
    songRating: number
    rating: number
    isModified: boolean

    isFR: boolean
    isPM: boolean
}

// TODO 删除不需要的项目
export interface SlstItem {
    "artist": string,
    "bpm": string,
    "bpm_base": number,
    "chart_designer_byn": string,
    "chart_designer_ftr": string,
    "chart_designer_prs": string,
    "chart_designer_pst": string,
    "date": number,  // 10位
    "difficultly_byn": number,  // -1表示不存在
    "difficultly_ftr": number,
    "difficultly_prs": number,
    "difficultly_pst": number,
    "jacket_designer_byn": string,
    "jacket_designer_ftr": string,
    "jacket_designer_prs": string,
    "jacket_designer_pst": string,
    "name_en": string,
    "name_jp": string,
    "notes_byn": number,  // -1表示不存在
    "notes_ftr": number,
    "notes_prs": number,
    "notes_pst": number,
    "pakset": string,
    "rating_byn": number,  // -1表示不存在
    "rating_ftr": number,
    "rating_prs": number,
    "rating_pst": number,
    "remote_download": string,
    "sid": string,
    "side": number,
    "time": number,
    "world_unlock": string
}

export interface SlstRecords extends BaseRetData{
    data: SlstItem[]
}

export interface BindData extends BaseRetData {
    data?: {
        "arc_account": string,
        "qq_name": string | null,
        "github_name": string | null
    }
}


export interface Rect {
    width: number
    height: number
}

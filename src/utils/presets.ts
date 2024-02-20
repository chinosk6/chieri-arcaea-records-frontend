import {B30RetModel} from "./models.ts";


export const QQOauthLink = `https://graph.qq.com/oauth2.0/authorize?response_type=token&client_id=${102096390}&redirect_uri=https%3A%2F%2Fwww.chinosk6.cn%2Farcweb%2Foauth_callback%3Ftype%3Dqq&scope=get_user_info`
export const GithubOauthLink = `https://github.com/login/oauth/authorize?client_id=f824df6271e68153a637&redirect_uri=https%3A%2F%2Fwww.chinosk6.cn%2Farcweb%2Foauth_callback%3Ftype%3Dgithub&scope=user`


export function getDefaultGrade(userName: string, userId: number): B30RetModel {
    return {
        "best_clear_type": 0,
        "character": 1,
        "clear_type": 0,
        "difficulty": 2,
        "health": 0,
        "is_char_uncapped": false,
        "is_skill_sealed": false,
        "miss_count": 0,
        "modifier": 0,
        "near_count": 0,
        "perfect_count": 0,
        "rank": 1,
        "score": 0,
        "shiny_perfect_count": 0,
        "song_id": "sayonarahatsukoi",
        "time_played": new Date().getTime(),

        "name": userName,
        "user_id": userId
    }
}


export const songDifficultyColor = [
    "cyan",
    "green.8",
    "purple",
    "red.8",
]

import {B30RetModel} from "./models.ts";


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

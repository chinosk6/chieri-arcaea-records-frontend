import {notifications} from "@mantine/notifications";
import {B30RetModel, Rect, SlstItem} from "./models.ts";

export function showErrorMessage(msg: string, title: string = "Error", autoClose: boolean | number = 10000) {
    notifications.show({
        title: title,
        message: msg,
        color: 'red',
        autoClose: autoClose
    })
}

export function showWarningMessage(msg: string, title: string = "注意", autoClose: boolean | number = 10000) {
    notifications.show({
        title: title,
        message: msg,
        color: 'yellow',
        autoClose: autoClose,
    })
}

export function showInfoMessage(msg: string, title: string = "Info", autoClose: boolean | number = 10000) {
    notifications.show({
        title: title,
        message: msg,
        color: 'blue',
        autoClose: autoClose,
    })
}


export async function encodeImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = function() {
            if (typeof reader.result === 'string') {
                resolve(reader.result.replace(/^data:image\/\w+;base64,/, ''));
            } else {
                reject(new Error('Failed to read Blob as base64'));
            }
        };
        reader.readAsDataURL(file);
    })
}


export function jumpToLink(url: string) {
    const link = document.createElement('a');
    link.href = url;
    link.target = "_blank";
    document.body.appendChild(link)
    link.click();
    document.removeChild(link)
}


export function calcSongRatingNumber(rating: number, score: number) {
    if (score < 9800000) {
        return Math.max(rating + (score - 9500000) / 300000, 0)
    }
    else if ((9800000 <= score) && (score <= 10000000)) {
        return rating + 1 + (score - 9800000) / 200000
    }
    else if (score <= 10020000) {
        return rating + 2
    }
    else {
        return rating + 1 + (score - 9800000) / 200000
    }
}

export function difficultyIndexToStringId(index: number) {
    switch (index) {
        case 0: return "pst"
        case 1: return "prs"
        case 2: return "ftr"
        case 3: return "byn"
        default: return "ftr"
    }
}

export function calcSItemRating(difficultyIndex: number, score: number, songItem: SlstItem | null): [number, number, string] {
    if (!songItem) return [-1, -1, "random"]
    const songRating = songItem[`rating_${difficultyIndexToStringId(difficultyIndex)}`] / 10
    return [calcSongRatingNumber(songRating, score), songRating, songItem.name_en]
}

export function calcSongRating(sid: string, difficultyIndex: number, score: number, slst: SlstItem[]): [number, number, string] {
    for (const i of slst) {
        if (i.sid === sid) {
            return calcSItemRating(difficultyIndex, score, i)
        }
    }
    return [-1, -1, sid]
}

// [getRating, songRating, songName]
export function calcSongRatingFromSong(song: B30RetModel, slst: SlstItem[]): [number, number, string] {
    for (const i of slst) {
        if (song.song_id === i.sid) {
            return calcSongRating(song.song_id, song.difficulty, song.score, slst)
        }
    }
    return [-1, -1, song.song_id]
}

export function calcScoreFromHits(purePlus: number, pure: number, far: number, lost: number) {
    const baseScore = 10000000
    const totalNotes = pure + far + lost
    if (totalNotes === 0) return 10000000
    const singleScore = baseScore / totalNotes / 2
    return Math.floor(singleScore * (pure * 2 + far) + purePlus)
}

export function checkSongInB30List(song: B30RetModel, list: B30RetModel[]) {
    for (let n = 0; n < list.length; n++) {
        const i = list[n]
        if ((song.song_id == i.song_id) && (song.difficulty == i.difficulty)) {
            return n
        }
    }
    return -1
}

export function addThousandSeparators(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

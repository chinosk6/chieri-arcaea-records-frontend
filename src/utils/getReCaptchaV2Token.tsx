import {modals} from "@mantine/modals";
import React from "react";
import ReCaptchaV2 from "../components/subs/ReCaptchaV2.tsx";
import {showWarningMessage} from "./utils.ts";


export const getReCaptchaV2Token = async (action: string) => {
    const modalID = "reCaptchaV2Modal"
    let hasResult = false

    showWarningMessage("您的操作可能存在风险，请进行人机验证", "人机验证", 5000)

    return new Promise<string>((resolve, reject) => {
        const onResult = (result: string) => {
            hasResult = true
            modals.closeAll()
            resolve(result)
        }

        modals.open({
            id: modalID,
            title: "人机验证",
            centered: true,
            children: (
                <ReCaptchaV2 action={action} onResult={onResult}/>
            ),
            onClose: () => {
                if (!hasResult) {
                    reject("取消了人机验证")
                }
            }
        })
    })
}
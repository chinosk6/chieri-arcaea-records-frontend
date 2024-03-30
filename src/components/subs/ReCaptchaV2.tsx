import React, {useEffect, useRef, useState} from "react";
import {showErrorMessage, showInfoMessage} from "../../utils/utils.ts";
import {Box, Flex} from "@mantine/core";


const RECAPTCHA_V2_ID = import.meta.env.VITE_RECAPTCHA_V2_ID


export default function ReCaptchaV2({action, onResult}: {action: string, onResult: (r: string) => any}) {
    const recaptchaRef = useRef<HTMLDivElement>(null)
    const [widgetId, setWidgetId] = useState<number | undefined>(undefined)

    const reRender = () => {
        window.grecaptcha.enterprise.reset(widgetId)
    }

    const render = () => {
        try {
            if (!recaptchaRef.current) return

            const widgetId = window.grecaptcha.enterprise.render(recaptchaRef.current, {
                sitekey: RECAPTCHA_V2_ID,
                // @ts-ignore
                action: action,
                callback: (response: string) => {
                    showInfoMessage("Verification success", "ReCaptcha", 3000)
                    onResult(response)
                },
                'expired-callback': () => reRender(),
                'error-callback': () => {
                    console.log("RecaptchaV2 error callback.")
                    reRender()
                }
            })
            setWidgetId(widgetId)
        }
        catch (e: any) {
            showErrorMessage(e.toString(), "reCaptcha Error")
        }
    }

    useEffect(() => {
        render()
    }, []);


    return (
        <Flex ref={recaptchaRef} className="g-recaptcha" data-sitekey={RECAPTCHA_V2_ID} data-action={action} justify="center"/>
    )
}

const scriptId = 'recaptcha-script'
const RECAPTCHA_ID = import.meta.env.VITE_RECAPTCHA_ID

class ReCaptcha {
    private visible = true

    render() {
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script')
            script.id = scriptId
            // script.src = `https://recaptcha.google.cn/recaptcha/api.js?render=${RECAPTCHA_ID}`
            script.src = `https://www.recaptcha.net//recaptcha/api.js?render=${RECAPTCHA_ID}`
            document.body.appendChild(script)
            script.onload = () => {
                if (this.visible) {
                    this.showBandage()
                }
                else {
                    this.hideBandage()
                }
            }
        }
    }

    async getToken(action: string): Promise<string> {
        return new Promise<string>((resolve) => {
            window.grecaptcha.ready(() => {
                window.grecaptcha.execute(RECAPTCHA_ID, { action: action }).then((token: string) => {
                    // console.log("getToken", token)
                    resolve(token)
                })
            })
        })
    }

    hideBandage(needRetry = true, retry = 0) {
        this.visible = false
        const badge = document.querySelector('.grecaptcha-badge');
        if (badge) {
            // @ts-ignore
            badge.style.display = 'none';
        }
        else {
            if (needRetry && (retry <= 9)) {
                setTimeout(() => this.hideBandage(needRetry, retry + 1), 1000)
            }
        }
    }

    showBandage() {
        this.visible = true
        const badge = document.querySelector('.grecaptcha-badge');
        if (badge) {
            // @ts-ignore
            badge.style.display = 'unset';
        }
    }

    destroy() {
        const script = document.getElementById(scriptId)
        if (script) {
            script.remove()
        }

        const iframe = document.querySelector('.grecaptcha-badge')
        if (iframe) {
            iframe.remove()
        }
    }
}

export default ReCaptcha
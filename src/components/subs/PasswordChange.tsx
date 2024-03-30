import {useForm} from "@mantine/form";
import {PageType} from "../../utils/enums.ts";
import {showErrorMessage, showInfoMessage} from "../../utils/utils.ts";
import {modals} from "@mantine/modals";
import {Button, PasswordInput} from "@mantine/core";
import {apiChangePassword} from "../../utils/api.ts";
import {useTranslation} from "react-i18next";


interface PasswordChangeType {
    password: string,
    password2: string
}


export function PasswordChange({setChangingPasswd, pageTypeSet, changingPasswd}: {setChangingPasswd: (v: boolean) => any, pageTypeSet: (pageType: PageType) => void,
    changingPasswd: boolean}) {
    const passwordChangeForm = useForm<PasswordChangeType>({
        initialValues: {
            password: '',
            password2: '',
        },
        validate: {
            password: (value, others) => (others.password2 === value ? null : t("pwdInconsistent")),
            password2: (value, others) => (others.password === value ? null : t("pwdInconsistent"))
        }
    });
    const {t} = useTranslation()

    return (
        <form onSubmit={passwordChangeForm.onSubmit((values) => {
            setChangingPasswd(true)
            apiChangePassword(values.password)
                .then((result) => {
                    if (result.success) {
                        showInfoMessage("", t("pwdChangeSuccess"), 6000)
                        modals.closeAll()
                        localStorage.removeItem("arc_token")
                        pageTypeSet(PageType.Login)
                    } else {
                        showErrorMessage(result.message, t("pwdChangeFailed"))
                    }
                })
                .catch((e) => showInfoMessage(e.toString(), t("pwdChangeError")))
                .finally(() => setChangingPasswd(false))
        })}>
            <PasswordInput label={t("newPwd")} placeholder={t("newPwd")} {...passwordChangeForm.getInputProps('password')}/>
            <PasswordInput label={t("confirmNewPwd")}
                           placeholder={t("confirmNewPwd")} {...passwordChangeForm.getInputProps('password2')}/>
            <Button fullWidth mt="md" loading={changingPasswd} type="submit">
                {t("change")}
            </Button>
        </form>
    )
}
import {useForm} from "@mantine/form";
import {PageType} from "../../utils/enums.ts";
import {showErrorMessage, showInfoMessage} from "../../utils/utils.ts";
import {modals} from "@mantine/modals";
import {Button, PasswordInput} from "@mantine/core";
import {apiChangePassword} from "../../utils/api.ts";


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
            password: (value, others) => (others.password2 === value ? null : "两次输入密码不一致"),
            password2: (value, others) => (others.password === value ? null : "两次输入密码不一致")
        }
    });

    return (
        <form onSubmit={passwordChangeForm.onSubmit((values) => {
            setChangingPasswd(true)
            apiChangePassword(values.password)
                .then((result) => {
                    if (result.success) {
                        showInfoMessage("", "密码修改成功", 6000)
                        modals.closeAll()
                        localStorage.removeItem("arc_token")
                        pageTypeSet(PageType.Login)
                    } else {
                        showErrorMessage(result.message, "密码修改失败")
                    }
                })
                .catch((e) => showInfoMessage(e.toString(), "密码修改出错"))
                .finally(() => setChangingPasswd(false))
        })}>
            <PasswordInput label="新密码" placeholder="新密码" {...passwordChangeForm.getInputProps('password')}/>
            <PasswordInput label="确认新密码"
                           placeholder="确认新密码" {...passwordChangeForm.getInputProps('password2')}/>
            <Button fullWidth mt="md" loading={changingPasswd} type="submit">
                修改
            </Button>
        </form>
    )
}
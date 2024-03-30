import React, {useState} from "react";
import {TextInput, Button, Group, Box, Text, PasswordInput} from '@mantine/core';
import {useForm} from "@mantine/form";
import {PageType} from "../utils/enums.ts";
import {apiRegister} from "../utils/api.ts";
import {showErrorMessage, showInfoMessage} from "../utils/utils.ts";
import {marginTopBottom} from "../styles.ts";
import {recaptcha} from "./MainPage.tsx";
import {getReCaptchaV2Token} from "../utils/getReCaptchaV2Token.tsx";
import {useTranslation} from "react-i18next";


export default function RegisterPage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const {t} = useTranslation()
    const form = useForm({
        initialValues: {
            userName: '',
            password: '',
            password2: '',
            email: '',
        },

        validate: {
            userName: (value) => (/^\d+$/.test(value) ? t("userNameCantPureNumber") : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : t("invalidEmail")),
            password: (value, others) => (others.password2 === value ? null : t("pwdInconsistent")),
            password2: (value, others) => (others.password === value ? null : t("pwdInconsistent"))
        },
    });

    const [isReging, setIsReging] = useState(false)

    const onClickReturnLogin = () => {
        pageTypeSet(PageType.Login)
    }

    const onClickRegister = (values: {userName: string, password: string, password2: string, email: string}, captchaVer = "v3") => {
        setIsReging(true)

        const getReCaptchaToken = captchaVer == "v2" ? getReCaptchaV2Token : recaptcha.getToken

        getReCaptchaToken("arc_register")
            .then((token) => {
                setIsReging(true)
                apiRegister(values.userName, values.password, token, captchaVer)
                    .then(
                        (result) => {
                            if (result.success) {
                                showInfoMessage("", t("registerSuccess"), 5000)
                                pageTypeSet(PageType.Login)
                            }
                            else {
                                if (result.message == "useReCaptchaV2") {
                                    if (captchaVer != "v2") {
                                        return onClickRegister(values, "v2")
                                    }
                                }
                                showErrorMessage(result.message, t("registerFailed"))
                            }
                        })
                    .catch((e) => showErrorMessage(e.toString(), t("error")))
                    .finally(() => setIsReging(false))
            })
            .catch((e) => {
                showErrorMessage(e.toString(), "reCaptcha Error")
                    setIsReging(false)
            })
    }

    return (
        <Box maw={340} mx="auto" style={marginTopBottom}>
            <Text fw={700} size="xl">{t("register")}</Text>
            <form onSubmit={form.onSubmit((values) =>onClickRegister(values))}>
                <TextInput
                    withAsterisk
                    label={t("userName")}
                    placeholder={t("userNameForLogin")}
                    {...form.getInputProps('userName')}
                />
                <PasswordInput
                    withAsterisk
                    label={t("pwd")}
                    placeholder={t("pwd")}
                    {...form.getInputProps('password')}
                />
                <PasswordInput
                    withAsterisk
                    label={t("confirmPwd")}
                    placeholder={t("enterPwdAgain")}
                    {...form.getInputProps('password2')}
                />
                <TextInput
                    withAsterisk
                    label={t("email")}
                    placeholder={t("canRetrieveAccount")}
                    {...form.getInputProps('email')}
                />

                <Group justify="flex-end" mt="md">
                    <Button onClick={onClickReturnLogin}>{t("returnLogin")}</Button>
                    <Button type="submit" disabled={isReging}>{t("register")}</Button>
                </Group>
            </form>
        </Box>
    );
}
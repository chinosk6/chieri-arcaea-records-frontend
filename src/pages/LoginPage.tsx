import React, { useState } from "react";
import {TextInput, Button, Group, Box, Text, PasswordInput, Divider, ActionIcon} from '@mantine/core';
import {useForm} from "@mantine/form";
import {PageType} from "../utils/enums.ts";
import {apiLogin} from "../utils/api.ts";
import {jumpToLink, showErrorMessage, showInfoMessage} from "../utils/utils.ts";
import {iconMStyle, marginTopBottom, maxWidth} from "../styles.ts";
import {recaptcha} from "./MainPage.tsx";
import Icon from "@mdi/react";
import {mdiGithub, mdiQqchat} from "@mdi/js";
import {GithubOauthLink, QQOauthLink} from "../utils/presets.ts";
import {getReCaptchaV2Token} from "../utils/getReCaptchaV2Token.tsx";
import {useTranslation} from "react-i18next";


export default function LoginPage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const form = useForm({
        initialValues: {
            userName: '',
            password: '',
        }
    });
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const {t} = useTranslation()

    const onClickRegister = () => {
        pageTypeSet(PageType.Register)
    }

    const onClickLogin = (values: {userName: string, password: string}, captchaVer = "v3") => {
        setIsLoggingIn(true)
        const getReCaptchaToken = captchaVer == "v2" ? getReCaptchaV2Token : recaptcha.getToken

        getReCaptchaToken("arc_login")
            .then((token) => {
                setIsLoggingIn(true)
                apiLogin(values.userName, values.password, token, captchaVer)
                    .then((result) => {
                        if (result.success) {
                            localStorage.setItem("arc_token", result.message)
                            showInfoMessage("", t("loginSuccess"), 3000)
                            pageTypeSet(PageType.Records)
                        }
                        else {
                            if (result.message == "useReCaptchaV2") {
                                if (captchaVer != "v2") {
                                    return onClickLogin(values, "v2")
                                }
                            }
                            showErrorMessage(result.message, t("loginFailed"))
                        }
                    })
                    .catch((e) => showErrorMessage(e.toString(), t("error")))
                    .finally(() => setIsLoggingIn(false))
            })
            .catch((e) => {
                showErrorMessage(e.toString(), "reCaptcha Error")
                setIsLoggingIn(false)
            })
    }

    return (
        <Box maw={340} mx="auto" style={marginTopBottom}>
            <Text fw={700} size="xl">{t("login")}</Text>

            <form onSubmit={form.onSubmit((values) => onClickLogin(values))}>
                <TextInput
                    withAsterisk
                    label={t("userName")}
                    placeholder={t("inputUserName")}
                    {...form.getInputProps('userName')}
                />
                <PasswordInput
                    withAsterisk
                    label={t("pwd")}
                    placeholder={t("pwd")}
                    {...form.getInputProps('password')}
                />

                <Group mt="md" justify="space-between">
                    <Button>{t("forgotPwd?")}</Button>
                    <Group justify="flex-end">
                        <Button onClick={onClickRegister}>{t("register")}</Button>
                        <Button type="submit" disabled={isLoggingIn}>{t("login")}</Button>
                    </Group>
                </Group>
            </form>
            <Divider my="md" label={t("thirdPartLogin")}/>
            <Group justify="center">
            <ActionIcon variant="light" size="md"
                            onClick={() => {
                                localStorage.removeItem("arc_token")
                                jumpToLink(QQOauthLink, "_self")
                            }}>
                    <Icon path={mdiQqchat} style={iconMStyle}/>
                </ActionIcon>
                <ActionIcon variant="light" size="md"
                            onClick={() => {
                                localStorage.removeItem("arc_token")
                                jumpToLink(GithubOauthLink, "_self")
                            }}>
                    <Icon path={mdiGithub} style={iconMStyle}/>
                </ActionIcon>
            </Group>
        </Box>
    );
}

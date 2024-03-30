import React, {useEffect, useRef, useState} from "react";
import {Box, Button, Checkbox, FileButton, Group, PasswordInput, Text, TextInput} from '@mantine/core';
import {PageType} from "../utils/enums.ts";
import {iconMStyle, marginTopBottom, maxWidth} from "../styles.ts";
import Icon from "@mdi/react";
import {mdiGithub, mdiQqchat, mdiSync, mdiUpload} from "@mdi/js";
import {apiBind, apiGetIsBind, apiGetIsLogin, apiUnbindOauth, apiUploadSt3} from "../utils/api.ts";
import {jumpToLink, showErrorMessage, showInfoMessage, showWarningMessage} from "../utils/utils.ts";
import {useForm} from "@mantine/form";
import {recaptcha} from "./MainPage.tsx";
import {GithubOauthLink, QQOauthLink} from "../utils/presets.ts";
import {getReCaptchaV2Token} from "../utils/getReCaptchaV2Token.tsx";
import {useTranslation} from "react-i18next";


export default function AccountBindPage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const form = useForm({
        initialValues: {
            userName: localStorage.getItem("bind_account") || '',
            password: localStorage.getItem("bind_password") || '',
            isUploadCookie: true
        }
    })
    const [file, setFile] = useState<File | null>(null)
    const [bindCode, setBindCode] = useState<string | null>(null)
    const [bindGithub, setBindGithub] = useState<string | null>(null)
    const [bindQQ, setBindQQ] = useState<string | null>(null)
    const [isBinding, setIsBinding] = useState(false)
    const resetRef = useRef<() => void>(null)
    const {t, i18n} = useTranslation()

    const checkLangAndGoToDocs = () => {
        let url: string
        switch (i18n.language) {
            case "en": url = "https://chieri.docs.chinosk6.cn/discord/arcaea.html#sync-local-st3-database"; break;
            default: url = "https://chieri.docs.chinosk6.cn/group/arcaea.html#%E5%90%8C%E6%AD%A5%E6%9C%AC%E5%9C%B0-st3-%E6%95%B0%E6%8D%AE%E5%BA%93";
        }
        jumpToLink(url)
    }

    const clearFile = () => {
        setFile(null)
        resetRef.current?.()
    }

    const checkBindAccount = () => {
        apiGetIsBind()
            .then((data) => {
                if (data.success) {
                    setBindCode(data.data!.arc_account)
                    setBindGithub(data.data!.github_name)
                    setBindQQ(data.data!.qq_name)
                }
                else {
                    setBindCode(null)
                }
            })
            .catch((e) => {
                setBindCode(null)
                showErrorMessage(e.toString(), t("getBindFailed"))
            })
    }

    const checkIsLogin = () => {
        apiGetIsLogin()
            .then((result) => {
                if (!result.success) {
                    pageTypeSet(PageType.Login)
                    showWarningMessage(t("pleaseLogin"), t("notLogin"))
                }
                else {
                    checkBindAccount()
                }
            })
            .catch((e) => showErrorMessage(e.toString(), t("error")))
    }

    const onclickBindAccount = (value: {userName: string, password: string, isUploadCookie: boolean}, captchaVer = "v3") => {
        setIsBinding(true)

        const getReCaptchaToken = captchaVer == "v2" ? getReCaptchaV2Token : recaptcha.getToken

        getReCaptchaToken("arc_bind")
            .then((token) => {
                setIsBinding(true)
                apiBind(value.userName, value.password, value.isUploadCookie, token, captchaVer)
                    .then((result) => {
                        if (result.success) {
                            showInfoMessage(result.message, t("bindSuccess"))
                            localStorage.setItem("bind_account", value.userName)
                            localStorage.setItem("bind_password", value.password)
                            checkBindAccount()
                        }
                        else {
                            if (result.message == "useReCaptchaV2") {
                                if (captchaVer != "v2") {
                                    return onclickBindAccount(value, "v2")
                                }
                            }
                            showErrorMessage(result.message, t("bindFailed"))
                        }
                    })
                    .catch((e) => showErrorMessage(e.toString(), t("bindErr")))
                    .finally(() => setIsBinding(false))

            })
            .catch((e) => {
                showErrorMessage(e.toString(), "reCaptcha Error")
                setIsBinding(false)
            })
    }

    const onclickUploadSt3 = () => {
        if (!file) return
        setIsBinding(true)
        apiUploadSt3(file)
            .then((result) => {
                if (result.success) {
                    showInfoMessage("", t("uploadSuccess"), 5000)
                }
                else {
                    showErrorMessage(result.message, t("uploadFailed"))
                }
            })
            .catch((e) => showErrorMessage(e.toString(), t("uploadErr")))
            .finally(() => setIsBinding(false))
    }

    const reqUnbind = (type: string) => {
        apiUnbindOauth(type)
            .then((result) => {
                if (result.success) {
                    showInfoMessage("", t("cancelBind"))
                }
                else {
                    showErrorMessage(result.message, t("cancelBindFailed"))
                }
            })
            .catch((e) => showErrorMessage(e.toString(), t("cancelBindErr")))
            .finally(() => checkIsLogin())
    }

    useEffect(() => {
        checkIsLogin()
    }, []);

    return (
            <Box style={marginTopBottom}>
                <Group>
                    <Text>
                        <h1>{t("bindT1")}</h1>
                        <Text>{t("bindT2")}</Text>
                        <h2>{t("bindT3")}</h2>
                        <Text>{t("see")}: <Text span c="blue" onClick={() => checkLangAndGoToDocs()}>{t("docs")}</Text></Text>
                        <h2>{t("bindT4")}</h2>
                        <Text fw={700}>{t("bindT5")}</Text>
                        {form.values.isUploadCookie && <Text fw={700}>{t("bindT6")}</Text>}
                        {bindCode && <Text fw={700} c="red">{t("bindT7")}: {bindCode}</Text>}
                    </Text>
                </Group>

                <Group style={marginTopBottom}>
                    <form onSubmit={form.onSubmit((values) => onclickBindAccount(values))} style={maxWidth}>
                        <Box maw={450}>
                            <TextInput
                                withAsterisk
                                label={t("ArcaeaAccount")}
                                placeholder={t("inputLoginArcaeaAccount")}
                                {...form.getInputProps('userName')}
                            />
                            <PasswordInput
                                withAsterisk
                                label={t("pwd")}
                                placeholder={t("arcaeaLoginPwd")}
                                {...form.getInputProps('password')}
                            />

                            <Group justify="space-between" style={marginTopBottom}>
                                <Checkbox label={t("uploadCookieForA")} defaultChecked {...form.getInputProps("isUploadCookie")}/>
                                <Button type="submit" disabled={isBinding} leftSection={
                                    <Icon path={mdiSync} style={iconMStyle}></Icon>
                                }>{t("bind")}</Button>

                            </Group>

                        </Box>
                    </form>
                </Group>

                <Box>
                    <Text>
                        <h3>{t("uploadData")}</h3>
                    </Text>

                    <Group maw={450}>
                        <Group style={maxWidth}>
                            <Group style={maxWidth} grow>
                                <FileButton disabled={!bindCode} onChange={setFile} accept="*">
                                    {(props) => <Button {...props}>Select st3 File</Button>}
                                </FileButton>
                                <Button disabled={!file} color="red" onClick={clearFile}>
                                    Clear
                                </Button>
                            </Group>
                            {file && (
                                <Text size="sm">
                                    Picked file: {file.name}
                                </Text>
                            )}
                        </Group>

                        <Button fullWidth disabled={!file || isBinding} onClick={() => onclickUploadSt3()} leftSection={
                            <Icon path={mdiUpload} style={iconMStyle}></Icon>
                        }>{t("upload")} st3</Button>
                    </Group>
                </Box>

                <Box>
                    <Text>
                        <h3>{t("bindThirdPartLogin")}</h3>
                    </Text>

                    <Group maw={450}>
                        {bindQQ ?
                            <Button variant="outline" color="red" fullWidth onClick={() => reqUnbind("qq")}
                                    leftSection={<Icon path={mdiQqchat} style={iconMStyle}></Icon>}>{t("unbind")} QQ: {bindQQ}</Button> :
                            <Button fullWidth onClick={() => jumpToLink(QQOauthLink, "_self")}
                                    leftSection={<Icon path={mdiQqchat} style={iconMStyle}></Icon>}>{t("bind")} QQ</Button>
                        }
                        {bindGithub ?
                            <Button variant="outline" color="red" fullWidth onClick={() => reqUnbind("github")} leftSection={
                                <Icon path={mdiGithub} style={iconMStyle}></Icon>}>{t("unbind")} GitHub: {bindGithub}</Button> :
                            <Button fullWidth onClick={() => jumpToLink(GithubOauthLink, "_self")} leftSection={
                                <Icon path={mdiGithub} style={iconMStyle}></Icon>}>{t("bind")} GitHub</Button>
                        }
                    </Group>
                </Box>
            </Box>
    );
}

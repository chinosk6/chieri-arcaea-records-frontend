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
                showErrorMessage(e.toString(), "获取绑定数据失败")
            })
    }

    const checkIsLogin = () => {
        apiGetIsLogin()
            .then((result) => {
                if (!result.success) {
                    pageTypeSet(PageType.Login)
                    showWarningMessage("请先登录", "未登录")
                }
                else {
                    checkBindAccount()
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "错误"))
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
                            showInfoMessage(result.message, "绑定成功")
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
                            showErrorMessage(result.message, "绑定失败")
                        }
                    })
                    .catch((e) => showErrorMessage(e.toString(), "绑定账号出错"))
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
                    showInfoMessage("", "上传成功", 5000)
                }
                else {
                    showErrorMessage(result.message, "上传失败")
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "上传出错"))
            .finally(() => setIsBinding(false))
    }

    const reqUnbind = (type: string) => {
        apiUnbindOauth(type)
            .then((result) => {
                if (result.success) {
                    showInfoMessage("", "已取消绑定")
                }
                else {
                    showErrorMessage(result.message, "取消绑定失败")
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "取消绑定出错"))
            .finally(() => checkIsLogin())
    }

    useEffect(() => {
        checkIsLogin()
    }, []);

    return (
            <Box style={marginTopBottom}>
                <Group>
                    <Text>
                        <h1>账号绑定/数据更新</h1>
                        <Text>推荐使用 APP/XP模块 绑定</Text>
                        <h2>从 APP/XP模块 绑定</h2>
                        <Text>见: <Text span c="blue" onClick={() => jumpToLink("https://chieri.docs.chinosk6.cn/group/arcaea.html#%E5%90%8C%E6%AD%A5%E6%9C%AC%E5%9C%B0-st3-%E6%95%B0%E6%8D%AE%E5%BA%93")}>文档</Text></Text>
                        <h2>在本页面绑定</h2>
                        <Text fw={700}>账号/密码仅用作数据同步，服务器不会保存您的密码。</Text>
                        {form.values.isUploadCookie && <Text fw={700}>当服务器 Cookie 过期后，到本页再次绑定也可以更新 Cookie。</Text>}
                        {bindCode && <Text fw={700} c="red">您已绑定到: {bindCode}</Text>}
                    </Text>
                </Group>

                <Group style={marginTopBottom}>
                    <form onSubmit={form.onSubmit((values) => onclickBindAccount(values))} style={maxWidth}>
                        <Box maw={450}>
                            <TextInput
                                withAsterisk
                                label="Arcaea 账号"
                                placeholder="输入用于登录的 Arcaea 账号"
                                {...form.getInputProps('userName')}
                            />
                            <PasswordInput
                                withAsterisk
                                label="密码"
                                placeholder="Arcaea 登录密码"
                                {...form.getInputProps('password')}
                            />

                            <Group justify="space-between" style={marginTopBottom}>
                                <Checkbox label="上传 Cookie 用于 /a 指令" defaultChecked {...form.getInputProps("isUploadCookie")}/>
                                <Button type="submit" disabled={isBinding} leftSection={
                                    <Icon path={mdiSync} style={iconMStyle}></Icon>
                                }>绑定</Button>

                            </Group>

                        </Box>
                    </form>
                </Group>

                <Box>
                    <Text>
                        <h3>上传数据</h3>
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
                        }>上传 st3</Button>
                    </Group>
                </Box>

                <Box>
                    <Text>
                        <h3>绑定第三方登录</h3>
                    </Text>

                    <Group maw={450}>
                        {bindQQ ?
                            <Button variant="outline" color="red" fullWidth onClick={() => reqUnbind("qq")}
                                    leftSection={<Icon path={mdiQqchat} style={iconMStyle}></Icon>}>取消绑定 QQ: {bindQQ}</Button> :
                            <Button fullWidth onClick={() => jumpToLink(QQOauthLink, "_self")}
                                    leftSection={<Icon path={mdiQqchat} style={iconMStyle}></Icon>}>绑定 QQ</Button>
                        }
                        {bindGithub ?
                            <Button variant="outline" color="red" fullWidth onClick={() => reqUnbind("github")} leftSection={
                                <Icon path={mdiGithub} style={iconMStyle}></Icon>}>取消绑定 GitHub: {bindGithub}</Button> :
                            <Button fullWidth onClick={() => jumpToLink(GithubOauthLink, "_self")} leftSection={
                                <Icon path={mdiGithub} style={iconMStyle}></Icon>}>绑定 GitHub</Button>
                        }
                    </Group>
                </Box>
            </Box>
    );
}

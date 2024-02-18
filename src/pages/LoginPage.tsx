import React, { useState } from "react";
import {TextInput, Button, Group, Box, Text, PasswordInput} from '@mantine/core';
import {useForm} from "@mantine/form";
import {PageType} from "../utils/enums.ts";
import {apiLogin} from "../utils/api.ts";
import {showErrorMessage, showInfoMessage} from "../utils/utils.ts";
import {marginTopBottom} from "../styles.ts";
import {recaptcha} from "./MainPage.tsx";


export default function LoginPage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const form = useForm({
        initialValues: {
            userName: '',
            password: '',
        }
    });
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const onClickRegister = () => {
        pageTypeSet(PageType.Register)
    }

    const onClickLogin = (values: {userName: string, password: string}) => {
        setIsLoggingIn(true)

        recaptcha.getToken("arc_login")
            .then((token) => {
                apiLogin(values.userName, values.password, token)
                    .then((result) => {
                        if (result.success) {
                            localStorage.setItem("arc_token", result.message)
                            showInfoMessage("", "登录成功", 3000)
                            pageTypeSet(PageType.Records)
                        }
                        else {
                            showErrorMessage(result.message, "登录失败")
                        }
                    })
                    .catch((e) => showErrorMessage(e.toString(), "错误"))
                    .finally(() => setIsLoggingIn(false))
            })
            .catch((e) => {
                showErrorMessage(e.toString(), "reCaptcha Error")
                setIsLoggingIn(false)
            })
    }

    return (
            <Box maw={340} mx="auto" style={marginTopBottom}>
                <Text fw={700} size="xl">登录</Text>
                <form onSubmit={form.onSubmit((values) => onClickLogin(values))}>
                    <TextInput
                        withAsterisk
                        label="用户名"
                        placeholder="输入用户名、邮箱或者绑定QQ号"
                        {...form.getInputProps('userName')}
                    />
                    <PasswordInput
                        withAsterisk
                        label="密码"
                        placeholder="密码"
                        {...form.getInputProps('password')}
                    />

                    <Group mt="md" justify="space-between">
                        <Button>忘记密码?</Button>
                        <Group justify="flex-end">
                            <Button onClick={onClickRegister}>注册</Button>
                            <Button type="submit" disabled={isLoggingIn}>登录</Button>
                        </Group>
                    </Group>
                </form>
            </Box>
    );
}

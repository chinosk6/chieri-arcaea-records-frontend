import React, {useState} from "react";
import {TextInput, Button, Group, Box, Text, PasswordInput} from '@mantine/core';
import {useForm} from "@mantine/form";
import {PageType} from "../utils/enums.ts";
import {apiRegister} from "../utils/api.ts";
import {showErrorMessage, showInfoMessage} from "../utils/utils.ts";
import {marginTopBottom} from "../styles.ts";
import {recaptcha} from "./MainPage.tsx";


export default function RegisterPage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const form = useForm({
        initialValues: {
            userName: '',
            password: '',
            password2: '',
            email: '',
        },

        validate: {
            userName: (value) => (/^\d+$/.test(value) ? "用户名不能是纯数字" : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : "不合法的邮箱"),
            password: (value, others) => (others.password2 === value ? null : "两次输入密码不一致"),
            password2: (value, others) => (others.password === value ? null : "两次输入密码不一致")
        },
    });

    const [isReging, setIsReging] = useState(false);

    const onClickReturnLogin = () => {
        pageTypeSet(PageType.Login)
    }

    const onClickRegister = (values: {userName: string, password: string, password2: string, email: string}) => {
        setIsReging(true)

        recaptcha.getToken("arc_register")
            .then((token) => {
                apiRegister(values.userName, values.password, token)
                    .then(
                        (result) => {
                            if (result.success) {
                                showInfoMessage("", "注册成功", 5000)
                                pageTypeSet(PageType.Login)
                            }
                            else {
                                showErrorMessage(result.message, "注册失败")
                            }
                        })
                    .catch((e) => showErrorMessage(e.toString(), "错误"))
                    .finally(() => setIsReging(false))
            })
            .catch((e) => {
                showErrorMessage(e.toString(), "reCaptcha Error")
                    setIsReging(false)
            })
    }

    return (
        <Box maw={340} mx="auto" style={marginTopBottom}>
            <Text fw={700} size="xl">注册</Text>
            <form onSubmit={form.onSubmit((values) =>onClickRegister(values))}>
                <TextInput
                    withAsterisk
                    label="用户名"
                    placeholder="用于登录的用户名"
                    {...form.getInputProps('userName')}
                />
                <PasswordInput
                    withAsterisk
                    label="密码"
                    placeholder="密码"
                    {...form.getInputProps('password')}
                />
                <PasswordInput
                    withAsterisk
                    label="确认密码"
                    placeholder="再次输入密码"
                    {...form.getInputProps('password2')}
                />
                <TextInput
                    withAsterisk
                    label="邮箱"
                    placeholder="可用于找回账号"
                    {...form.getInputProps('email')}
                />

                <Group justify="flex-end" mt="md">
                    <Button onClick={onClickReturnLogin}>返回登录</Button>
                    <Button type="submit" disabled={isReging}>注册</Button>
                </Group>
            </form>
        </Box>
    );
}
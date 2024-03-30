import {Button, Flex, Tabs} from "@mantine/core";
import {PageType} from "../utils/enums.ts";
import {iconMStyle, maxWidth} from "../styles.ts";
import Icon from "@mdi/react";
import {mdiAccount, mdiDatabase, mdiExitToApp, mdiHome, mdiLockReset} from "@mdi/js";
import React, {useState} from "react";
import {modals} from "@mantine/modals";
import {PasswordChange} from "./subs/PasswordChange.tsx";
import {useTranslation} from "react-i18next";


export function PageNavbar({currentStat, changePageStat}: {currentStat: PageType, changePageStat: (p: PageType) => any}) {
    const [changingPasswd, setChangingPasswd] = useState(false)
    const {t} = useTranslation()

    const onExitLogin = () => {
        localStorage.removeItem("arc_token")
        changePageStat(PageType.Home)
    }

    return (
        <>
            <Tabs variant="pills" orientation="vertical" defaultValue="gallery" value={currentStat} style={{flex: 1}}
                  onChange={(e) => {if (e) changePageStat(e as PageType)}}>
                <Tabs.List style={maxWidth}>
                    <Tabs.Tab value={PageType.Home} leftSection={<Icon path={mdiHome} style={iconMStyle}/>}>
                        {t("homePage")}
                    </Tabs.Tab>
                    {/*<Tabs.Tab value={PageType.Login} leftSection={<Icon path={mdiLogin} style={iconMStyle}/>}>*/}
                    {/*    登录*/}
                    {/*</Tabs.Tab>*/}
                    <Tabs.Tab value={PageType.AccountBind} leftSection={<Icon path={mdiAccount} style={iconMStyle}/> }>
                        {t("accountManage")}
                    </Tabs.Tab>
                    <Tabs.Tab value={PageType.Records} leftSection={<Icon path={mdiDatabase} style={iconMStyle}/> }>
                        {t("scoreM")}
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>
            <Flex gap="md" justify="flex-start" align="flex-end" direction="row" wrap="wrap" style={maxWidth}>
                <Button color="red" variant="outline" justify="start" fullWidth leftSection={
                    <Icon path={mdiLockReset} style={iconMStyle}></Icon>
                } onClick={() => {
                    modals.open({
                        title: t("changePasswd"),
                        centered: true,
                        children: (
                            <PasswordChange setChangingPasswd={setChangingPasswd}
                                            changingPasswd={changingPasswd} pageTypeSet={changePageStat}/>
                        ),
                    })
                }}>{t("changePasswd")}</Button>
                <Button variant="outline" color="red" fullWidth justify="start" onClick={() => onExitLogin()}
                        leftSection={<Icon path={mdiExitToApp} style={iconMStyle}/>}>{t("logout")}</Button>
            </Flex>

        </>
    )
}
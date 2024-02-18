import React, {useEffect, useState} from "react";
import {
    AppShell,
    Container,
    MantineProvider,
} from "@mantine/core";
import LoginPage from "./LoginPage.tsx";
import {PageType} from "../utils/enums.ts";
import RegisterPage from "./RegisterPage.tsx";
import {apiGetIsLogin, apiGetSlst} from "../utils/api.ts";
import {showErrorMessage} from "../utils/utils.ts";
import ReCaptcha from "../utils/reCaptcha.ts";
import {useDisclosure} from "@mantine/hooks";
import RecordsPage from "./RecordsPage.tsx";
import HomePage from "./HomePage.tsx";
import {SlstItem} from "../utils/models.ts";
import AccountBindPage from "./AccountBindPage.tsx";
import {PageNavbar} from "../components/PageNavbar.tsx";
import {PageHeader} from "../components/PageHeader.tsx";


export const recaptcha = new ReCaptcha()


export default function MainPage() {
    const [currentStat, setCurrentStat] = useState(PageType.Home);
    const [width, setWidth] = useState(window.innerWidth)
    const [opened, { toggle }] = useDisclosure();
    // const [height, setHeight] = useState(window.innerHeight)
    const [songs, setSongs] = useState<SlstItem[] | null>(null)


    const changePageStat = (pageType: PageType) => {
        if (pageType == PageType.Records) {
            if (!songs) {
                refreshSlst()
                    .then((_) => {
                        setCurrentStat(pageType)
                    })
            }
            else {
                setCurrentStat(pageType)
            }
            recaptcha.hideBandage()
        }
        else {
            setCurrentStat(pageType)
            recaptcha.showBandage()
        }
    }

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            // setHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const refreshSlst = () => {
        return new Promise((resolve, reject) => {
            apiGetSlst()
                .then((result) => {
                    if (result.success) {
                        setSongs(result.data)
                        resolve(1)
                    }
                    else {
                        showErrorMessage(result.message, "获取曲目列表失败")
                        reject(result.message)
                    }
                })
                .catch((e) => {
                    showErrorMessage(e.toString(), "获取曲目列表出错")
                    reject(e.toString())
                })
        })
    }

    const refreshUserData = () => {
        const userToken = localStorage.getItem("arc_token")
        if (!userToken) changePageStat(PageType.Home)
        apiGetIsLogin()
            .then((result) => {
                if (result.success) {
                    if (currentStat == PageType.Home) {
                        changePageStat(PageType.Records)
                    }
                }
                else {
                    if (currentStat != PageType.Home) showErrorMessage(result.message, "获取登录态失败")
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "错误"))
    }


    useEffect(() => {
        const token = localStorage.getItem("arc_token")
        if (token) {
            refreshUserData()
        }
        recaptcha.render()
    }, []);


    return (
        <MantineProvider>
            <AppShell header={{ height: 60 }} navbar={{width: 250, breakpoint: `sm`, collapsed: {mobile: !opened}}} padding="md">
                <AppShell.Header p="md">
                    <PageHeader opened={opened} toggle={toggle}/>
                </AppShell.Header>

                <AppShell.Navbar p="md">
                    <PageNavbar currentStat={currentStat} changePageStat={changePageStat}/>
                </AppShell.Navbar>

                <AppShell.Main>
                    <Container>
                        {(() => {
                            switch (currentStat) {
                                case PageType.Home:
                                    return <HomePage pageTypeSet={changePageStat}/>
                                case PageType.Login:
                                    return <LoginPage pageTypeSet={changePageStat}/>
                                case PageType.Register:
                                    return <RegisterPage pageTypeSet={changePageStat}/>
                                case PageType.Records:
                                    return <RecordsPage pageTypeSet={changePageStat} slst={songs!}/>
                                case PageType.AccountBind:
                                    return <AccountBindPage pageTypeSet={changePageStat}/>
                                default:
                                    return null
                            }
                        })()}
                    </Container>
                </AppShell.Main>

            </AppShell>
        </MantineProvider>
    );
}
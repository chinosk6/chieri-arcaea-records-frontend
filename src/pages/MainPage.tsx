import React, {useEffect, useState} from "react";
import {
    AppShell,
    Container,
    MantineProvider,
} from "@mantine/core";
import LoginPage from "./LoginPage.tsx";
import {PageType} from "../utils/enums.ts";
import RegisterPage from "./RegisterPage.tsx";
import {apiBindOauth, apiGetIsLogin, apiGetSlst} from "../utils/api.ts";
import {clearURLParameters, showErrorMessage, showInfoMessage} from "../utils/utils.ts";
import ReCaptcha from "../utils/reCaptcha.ts";
import {useDisclosure} from "@mantine/hooks";
import RecordsPage from "./RecordsPage.tsx";
import HomePage from "./HomePage.tsx";
import {SlstItem} from "../utils/models.ts";
import AccountBindPage from "./AccountBindPage.tsx";
import {PageNavbar} from "../components/PageNavbar.tsx";
import {PageHeader} from "../components/PageHeader.tsx";
import {useTranslation} from "react-i18next";


export const recaptcha = new ReCaptcha()


export default function MainPage() {
    const [currentStat, setCurrentStat] = useState(PageType.Home);
    const [width, setWidth] = useState(window.innerWidth)
    const [opened, { toggle }] = useDisclosure();
    // const [height, setHeight] = useState(window.innerHeight)
    const [songs, setSongs] = useState<SlstItem[] | null>(null)
    const {t} = useTranslation()


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
                        showErrorMessage(result.message, t("getSlstFailed"))
                        reject(result.message)
                    }
                })
                .catch((e) => {
                    showErrorMessage(e.toString(), t("getSlstErr"))
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
                    if (currentStat != PageType.Home) showErrorMessage(result.message, t("getLoginStatFailed"))
                }
            })
            .catch((e) => showErrorMessage(e.toString(), t("error")))
    }

    const onOauthData = (oauthData: string, new_ck: string | null, req_type: string) => {
        if (new_ck) {
            localStorage.setItem("arc_token", new_ck)
            refreshUserData()
        }
        else {
            const token = localStorage.getItem("arc_token")
            if (!token) {
                showErrorMessage(t("regFirst"), t("notReg"))
                return
            }
            apiGetIsLogin()
                .then((result) => {
                    if (result.success) {
                        apiBindOauth(req_type, oauthData)
                            .then((data) => {
                                if (data.success) {
                                    showInfoMessage("", t("bindSuccess"), 5000)
                                }
                                else {
                                    showErrorMessage(data.message, t("bindFailed"))
                                }
                            })
                            .catch((e) => showErrorMessage(e.toString(), t("bindThirdPartErr")))
                            .finally(() => changePageStat(PageType.AccountBind))
                    }
                    else {
                        if (currentStat != PageType.Home) showErrorMessage(result.message, t("getLoginStatFailed"))
                    }
                })
                .catch((e) => showErrorMessage(e.toString(), t("error")))
        }
    }

    useEffect(() => {
        const queryString = window.location.search
        const params = new URLSearchParams(queryString)
        const oauth_data = params.get('oauth_data')
        const new_ck = params.get('new_ck')
        const req_type = params.get('req_type')
        if (oauth_data && req_type) {
            onOauthData(oauth_data, new_ck, req_type)
            clearURLParameters()
        }
        else {
            const token = localStorage.getItem("arc_token")
            if (token) {
                refreshUserData()
            }
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
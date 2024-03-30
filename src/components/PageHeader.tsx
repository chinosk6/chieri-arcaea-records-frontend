import {ActionIcon, Burger, Group, Image, MantineTheme, Menu, Text, Tooltip} from "@mantine/core";
import {ThemeToggle} from "./subs/ThemeToggle.tsx";
import React, {useEffect, useState} from "react";
import Icon from "@mdi/react";
import {mdiGithub, mdiTranslate} from "@mdi/js";
import {iconMStyle} from "../styles.ts";
import {jumpToLink} from "../utils/utils.ts";
import {languages} from "../utils/i18n/config.ts";
import {useTranslation} from "react-i18next";


export function PageHeader({opened, toggle}: {opened: boolean, toggle: () => void}) {
    const [width, setWidth] = useState(window.innerWidth)
    // const [height, setHeight] = useState(window.innerHeight)
    const { t, i18n } = useTranslation()


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

    const setLanguage = (langId: string) => {
        i18n.changeLanguage(langId)
    }

    const getTitleHideW = () => {
        return i18n.language == "en" ? 510 : 455
    }


    return (
        <Group justify="space-between">
            <Group>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
                <Image src="favicon.jpg" w={30} h={30}/>
                {width >= getTitleHideW() && <Text fw={700}>Chieri Bot Arcaea {t("gradeManage")}</Text>}
            </Group>

            <Group>
                <Menu>
                    <Menu.Target>
                        <ActionIcon
                            variant="light"
                            onClick={() => {}}
                            size="md"
                        >
                            <Icon path={mdiTranslate} style={iconMStyle}/>
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        {languages.map((language) => (
                            <Menu.Item
                                key={language.value}
                                onClick={() => {setLanguage(language.value)}}
                            >
                                {language.label}
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>

                <Tooltip label="Github" position="left">
                    <ActionIcon variant="light" size="md" onClick={() => jumpToLink("https://github.com/chinosk6/chieri-arcaea-records-frontend")} >
                        <Icon path={mdiGithub} style={iconMStyle}/>
                    </ActionIcon>
                </Tooltip>

                <ThemeToggle/>
            </Group>

        </Group>
    )
}

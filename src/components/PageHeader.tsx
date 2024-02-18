import {ActionIcon, Burger, Group, Image, Text, Tooltip} from "@mantine/core";
import {ThemeToggle} from "./subs/ThemeToggle.tsx";
import React, {useEffect, useState} from "react";
import Icon from "@mdi/react";
import {mdiGithub} from "@mdi/js";
import {iconMStyle} from "../styles.ts";
import {jumpToLink} from "../utils/utils.ts";


export function PageHeader({opened, toggle}: {opened: boolean, toggle: () => void}) {
    const [width, setWidth] = useState(window.innerWidth)
    // const [height, setHeight] = useState(window.innerHeight)


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
                {width >= 410 && <Text fw={700}>Chieri Bot Arcaea 成绩管理</Text>}
            </Group>
            <Group>
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

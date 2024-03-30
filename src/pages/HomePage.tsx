import React from "react";
import {Box, Button, Flex, Group, Text} from '@mantine/core';
import {PageType} from "../utils/enums.ts";
import {marginTopBottom} from "../styles.ts";
import {jumpToLink} from "../utils/utils.ts";
import {useTranslation} from "react-i18next";


export default function HomePage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {
    const {t, i18n} = useTranslation()

    const checkLangAndGoToDocs = () => {
        let url: string
        switch (i18n.language) {
            case "en": url = "https://chieri.docs.chinosk6.cn/discord/arcaea.html#sync-local-st3-database"; break;
            default: url = "https://chieri.docs.chinosk6.cn/group/arcaea.html#%E5%90%8C%E6%AD%A5%E6%9C%AC%E5%9C%B0-st3-%E6%95%B0%E6%8D%AE%E5%BA%93";
        }
        jumpToLink(url)
    }

    return (
            <Flex gap="md" justify="center" align="center" direction="column" wrap="wrap" style={marginTopBottom}>
                <Text fw={700} size="40px">Chieri Bot <Text span fw={700} variant="gradient" gradient={{ from: 'grape', to: 'violet', deg: 90 }}>
                        Arcaea
                    </Text> {t("gradeManage")}
                </Text>
                <Text size="lg">{t("desc1")} <Text span fw={700} variant="gradient" gradient={{ from: 'grape', to: 'violet', deg: 90 }}>
                        Arcaea
                    </Text> {t("desc2")}
                </Text>
                <Group>
                    <Button onClick={() => pageTypeSet(PageType.Login)}>{t("login/register")}</Button>
                    <Button variant="default" onClick={() => checkLangAndGoToDocs()}>
                        {t("bindingSteps")}
                    </Button>
                </Group>
            </Flex>
    );
}

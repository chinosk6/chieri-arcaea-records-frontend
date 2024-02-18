import React from "react";
import {Box, Button, Flex, Group, Text} from '@mantine/core';
import {PageType} from "../utils/enums.ts";
import {marginTopBottom} from "../styles.ts";
import {jumpToLink} from "../utils/utils.ts";


export default function HomePage({pageTypeSet}: {pageTypeSet: (pageType: PageType) => void}) {

    return (
            <Flex gap="md" justify="center" align="center" direction="column" wrap="wrap" style={marginTopBottom}>
                <Text fw={700} size="40px">Chieri Bot <Text span fw={700} variant="gradient" gradient={{ from: 'grape', to: 'violet', deg: 90 }}>
                        Arcaea
                    </Text> 成绩管理
                </Text>
                <Text size="lg">基于本地 st3 存档 + 手动管理的 <Text span fw={700} variant="gradient" gradient={{ from: 'grape', to: 'violet', deg: 90 }}>
                        Arcaea
                    </Text> 查分器
                </Text>
                <Group>
                    <Button onClick={() => pageTypeSet(PageType.Login)}>登录/注册</Button>
                    <Button variant="default" onClick={() => jumpToLink("https://chieri.docs.chinosk6.cn/group/arcaea.html#%E5%90%8C%E6%AD%A5%E6%9C%AC%E5%9C%B0-st3-%E6%95%B0%E6%8D%AE%E5%BA%93")}>查看绑定步骤</Button>
                </Group>
            </Flex>
    );
}

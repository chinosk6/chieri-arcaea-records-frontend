import {
    ActionIcon,
    Group, rem,
    Tooltip,
    useComputedColorScheme,
    useMantineColorScheme,
    useMantineTheme
} from "@mantine/core";
import {useToggle} from "@mantine/hooks";
import {useEffect} from "react";
import Icon from "@mdi/react";
import {mdiThemeLightDark, mdiWeatherNight, mdiWeatherSunny} from "@mdi/js";
import {iconMStyle} from "../../styles.ts";


export function ThemeToggle() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [colorSchemeState, toggleColorSchemeState] = useToggle(['auto', 'dark', 'light'] as const);
    const computedColorScheme = useComputedColorScheme('light');
    const theme = useMantineTheme();

    useEffect(() => {
        toggleColorSchemeState(colorScheme);
    }, []);

    useEffect(() => {
        setColorScheme(colorSchemeState);
    }, [colorSchemeState]);

    return (
        <Group justify="center">
            <Tooltip label={colorSchemeState === 'auto' ? '跟随系统' : colorSchemeState === 'dark' ? '深色模式' : '浅色模式'} position="left">
                <ActionIcon variant="light" size="md" onClick={() => toggleColorSchemeState()} color={
                    colorSchemeState === 'auto' ? undefined : computedColorScheme === 'dark' ? theme.colors.blue[4] : theme.colors.yellow[6]
                }>
                    <Icon path={colorSchemeState === 'auto' ? mdiThemeLightDark : colorSchemeState === 'dark' ? mdiWeatherNight : mdiWeatherSunny}
                          style={iconMStyle}/>
                </ActionIcon>
            </Tooltip>
        </Group>
    );
}

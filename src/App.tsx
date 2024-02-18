import "@mantine/core/styles.css";
import {MantineProvider} from "@mantine/core";
import { theme } from "./theme";
import MainPage from "./pages/MainPage.tsx";
import {Notifications} from "@mantine/notifications";
import {ModalsProvider} from "@mantine/modals";

export default function App() {
    return <MantineProvider theme={theme} defaultColorScheme="dark">
        <ModalsProvider>
            <Notifications position="top-center" zIndex={3000} />
            <MainPage/>
        </ModalsProvider>
    </MantineProvider>
    }

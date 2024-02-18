import React, {useEffect, useRef, useState} from "react";
import {
    Accordion,
    ActionIcon,
    Box,
    Button,
    Card,
    Flex,
    Group,
    Image,
    rem,
    ScrollArea,
    Table,
    Text,
    Tooltip
} from '@mantine/core';
import {PageType} from "../utils/enums.ts";
import {apiGetAllRecords, apiGetIsBind, apiUpdateModifiedB30, imageResURLFmt} from "../utils/api.ts";
import {iconMStyle, marginTopBottom, maxWidth} from "../styles.ts";
import {B30RetModel, SlstItem, SongDisplay, UserRecordsData} from "../utils/models.ts";
import {
    addThousandSeparators,
    calcSongRatingFromSong,
    checkSongInB30List,
    showErrorMessage,
    showWarningMessage
} from "../utils/utils.ts";
import {recaptcha} from "./MainPage.tsx";
import Icon from "@mdi/react";
import {mdiArrowDown, mdiArrowUp, mdiCloseCircleOutline, mdiDelete, mdiPencil, mdiPlus} from "@mdi/js";
import {confirmEditGrade} from "../components/subs/confirms.tsx";
import {getDefaultGrade, songDifficultyColor} from "../utils/presets.ts";
import {useIntersection} from "@mantine/hooks";
import {SongFilter} from "../components/SongFilter.tsx";

const LazyLoadCount = 15

const sortKeys = [
    { name: 'Rating', key: 'rating' },
    { name: '曲名', key: 'songName' },
    { name: '定数', key: 'songRating' },
    { name: '分数', key: 'score' },
    { name: '游玩时间', key: 'time_played' },
]

export default function RecordsPage({pageTypeSet, slst}: {pageTypeSet: (pageType: PageType) => void, slst: SlstItem[]}) {
    const [records, setRecords] = useState<UserRecordsData | null>(null)
    const [songDisplayData, setSongDisplayData] = useState<SongDisplay[] | null>(null)
    const [fullSongDisplayData, setFullSongDisplayData] = useState<SongDisplay[] | null>(null)
    const [loadedRows, setLoadedRows] = useState(0)
    const { ref: lazyLoadBtnRef, entry } = useIntersection()
    const [sortBy, setSortBy] = useState("rating");
    const [isDESC, setIsDESC] = useState(true)

    const [difficulty, setDifficulty] = useState<number[]>([])
    const [passStat, setPassStat] = useState<string[]>([])
    const [gradeType, setGradeType] = useState<string[]>([])
    const [endRatingRange, setEndRatingRange] = useState<[number, number]>([1, 14])

    const [width, setWidth] = useState(window.innerWidth)
    // const [height, setHeight] = useState(window.innerHeight)

    const updateLoadedRows = () => {
        setLoadedRows(v => Math.min(v + LazyLoadCount, songDisplayData?.length || v + LazyLoadCount))
    }

    useEffect(() => {
        if (entry?.isIntersecting) {
            updateLoadedRows()
        }
    }, [entry?.isIntersecting]);

    const refreshRecords = () => {
        apiGetAllRecords()
            .then((result) => {
                if (result.success && result.data) {
                    if (!result.data.me) {
                        showWarningMessage("未找到个人数据。请先同步数成绩", "数据不全")
                        pageTypeSet(PageType.Home)
                        return
                    }
                    setRecords(result.data)
                    recaptcha.hideBandage()
                }
                else {
                    pageTypeSet(PageType.Login)
                }
            })
            .catch((e) => {
                showErrorMessage(e.toString(), "获取绑定信息失败")
                pageTypeSet(PageType.Login)
            })
    }

    
    const refreshSongDisplayData = (records: UserRecordsData | null) => {
        const checkSongState = (song: B30RetModel) => {
            if (song.perfect_count == 0) return [false, false]
            const pm = (song.miss_count == 0) && (song.near_count == 0)
            const fr = pm ? false : song.miss_count == 0  // 互斥，便于过滤器使用
            return [pm, fr]
        }

        if (!records) {
            setSongDisplayData(null)
            return null
        }
        const songDisplay: SongDisplay[] = []
        if (records.b30) {
            for (const i of records.b30.data) {
                const [rating, songRating, songName] = calcSongRatingFromSong(i, slst)
                const [pm, fr] = checkSongState(i)
                songDisplay.push({
                    ...i,
                    songName: songName,
                    songRating: songRating,
                    rating: rating,
                    isModified: false,
                    isPM: pm,
                    isFR: fr
                })
            }
        }
        if (records.modified_b30) {
            for (const i of records.modified_b30) {
                const listPos = checkSongInB30List(i, songDisplay)
                const [rating, songRating, songName] = calcSongRatingFromSong(i, slst)
                const [pm, fr] = checkSongState(i)
                if (listPos != -1) {
                    const origData = songDisplay[listPos]
                    songDisplay[listPos] = {
                        ...i,
                        songName: origData.songName,
                        songRating: origData.songRating,
                        rating: rating,
                        isModified: true,
                        isPM: pm,
                        isFR: fr
                    }
                }
                else {
                    songDisplay.push({
                        ...i,
                        songName: songName,
                        songRating: songRating,
                        rating: rating,
                        isModified: true,
                        isPM: pm,
                        isFR: fr
                    })
                }
            }
        }

        songDisplay.sort((a, b) => b.rating - a.rating);
        setSongDisplayData(songDisplay)
        setFullSongDisplayData(songDisplay)
        return songDisplay
    }

    const updateSortBy = (key: string, isClick: boolean) => {
        return new Promise((resolve) => {
            if (!isClick) {
                resolve(isDESC)
                return
            }
            setSortBy(currKey => {
                if (currKey === key) {
                    setIsDESC(currDesc => {
                        resolve(!currDesc)
                        return !currDesc
                    })
                    return key
                }
                else {
                    setIsDESC(true)
                    resolve(true)
                    return key
                }
            })
        })
    }

    const updateFilter = (difficulty: number[], passStat: string[], ratingRange: [number, number], gradeType: string[]) => {
        setDifficulty(difficulty)
        setPassStat(passStat)
        setGradeType(gradeType)
        setEndRatingRange(ratingRange)
        if (!fullSongDisplayData) return
        const newDisplay: SongDisplay[] = []
        for (const i of fullSongDisplayData) {
            if (difficulty.length > 0) {
                if (!difficulty.includes(i.difficulty)) continue
            }
            if (gradeType.length > 0) {
                let needRecord = false
                if (gradeType.includes("orig")) {
                    if (!i.isModified) needRecord = true
                }
                if (gradeType.includes("edited")) {
                    if (i.isModified) needRecord = true
                }
                if (!needRecord) continue
            }
            if (passStat.length > 0) {
                let needRecord = false
                if (!passStat.includes("all")) {
                    if (passStat.includes("isPM")) {
                        if (i.isPM) needRecord = true
                    }
                    if (passStat.includes("isFR")) {
                        if (i.isFR) needRecord = true
                    }
                    if (!needRecord) continue
                }
            }
            const [minRt, maxRt] = ratingRange
            if ((i.songRating < minRt) || (i.songRating > maxRt)) continue
            newDisplay.push(i)
        }
        sortSongDisplay(sortBy, false, newDisplay)
    }

    const sortSongDisplay = (key: string, isClick=true, targetSongDisplay?: SongDisplay[]) => {
        if (!songDisplayData) return
        updateSortBy(key, isClick)
            .then((currIsDesc) => {
                setSongDisplayData(songDisplay => {
                    const editSongDisplay = targetSongDisplay ? targetSongDisplay : songDisplay
                    editSongDisplay!.sort((a, b) => {
                        const aValue = a[key]
                        const bValue = b[key]
                        if (typeof aValue === "string") {
                            return currIsDesc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue)
                        }
                        return currIsDesc ? (bValue - aValue) : (aValue - bValue)
                    })
                    return [...editSongDisplay!]
                })
            })
    }

    const renderSortIndicator = (key: any) => {
        if (sortBy === key) {
            return <>
                { isDESC ? <Icon path={mdiArrowDown} style={iconMStyle}/> : <Icon path={mdiArrowUp} style={iconMStyle}/> }
            </>
        }
        return null
    }

    useEffect(() => {
        refreshSongDisplayData(records)
    }, [records]);

    useEffect(() => {
        setLoadedRows(v => v == LazyLoadCount ? v + 1 : LazyLoadCount)
    }, [songDisplayData]);

    useEffect(() => {
        updateFilter(difficulty, passStat, endRatingRange, gradeType)
    }, [fullSongDisplayData]);

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            // setHeight(window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        apiGetIsBind()
            .then((data) => {
                if (data.success) {
                    refreshRecords()
                }
                else {
                    showWarningMessage("您还未绑定 Arcaea 账号", "未绑定账号")
                    pageTypeSet(PageType.AccountBind)
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "获取绑定数据失败"))

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const songInfoToId = (song: B30RetModel) => {
        return `${song.song_id}-${song.difficulty}`
    }

    const onSubmitEditB30 = (newEditedList: B30RetModel[]) => {
        apiUpdateModifiedB30(newEditedList)
            .then((result) => {
                if (!result.success) {
                    showErrorMessage(result.message, "更新成绩失败")
                }
            })
            .catch((e) => showErrorMessage(e.toString(), "更新成绩出错"))
            .finally(() => {
                refreshRecords()
            })
    }

    const onClickDeleteB30Item = (song: SongDisplay, editList?: B30RetModel[]) => {
        let newEditedList: B30RetModel[] = editList ? [...editList] : []
        if (!song.isModified) {
            const newEditedSong = getDefaultGrade(song.name, song.user_id)
            newEditedSong.song_id = song.song_id
            newEditedSong.difficulty = song.difficulty
            newEditedList.push(newEditedSong)
        }
        else {
            const editPos = checkSongInB30List(song, newEditedList)
            if (editPos >= 0) {
                newEditedList = [...newEditedList.slice(0, editPos), ...newEditedList.slice(editPos + 1)]
            }
            else {
                showWarningMessage("未找到删除目标", "删除位置异常")
                return
            }
        }
        onSubmitEditB30(newEditedList)
    }

    const rows = songDisplayData?.slice(0, loadedRows)?.map((song) => (
        <Table.Tr key={songInfoToId(song)}>
            <Table.Td>
                <Group>
                    <Image src={imageResURLFmt(song.song_id, 100, song.difficulty)} w={rem(50)}/>
                    <Text c={songDifficultyColor[song.difficulty]} fw={700}>{song.songName} ({song.songRating.toFixed(1)})</Text>
                </Group>
            </Table.Td>
            <Table.Td>
                <Text fw={500}>{`${song.perfect_count} (+${song.shiny_perfect_count})`}</Text>
                <Text>{`${song.near_count} / ${song.miss_count}`}</Text>
            </Table.Td>
            <Table.Td>{width < 460 ? `${(song.score / 10000).toFixed()}w` : addThousandSeparators(song.score)}</Table.Td>
            <Table.Td>{song.rating.toFixed(4)}</Table.Td>
            <Table.Td>
                <Group>
                    <ActionIcon onClick={() => confirmEditGrade(slst, records!.me!, song, records?.modified_b30, onSubmitEditB30)}>
                        <Icon path={mdiPencil} style={iconMStyle}/>
                    </ActionIcon>
                    <Tooltip label={song.isModified ? "删除" : "归零"}>
                        <ActionIcon color="red" onClick={() => onClickDeleteB30Item(song, records?.modified_b30)}>
                            <Icon path={song.isModified ? mdiDelete : mdiCloseCircleOutline} style={iconMStyle}/>
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Table.Td>
        </Table.Tr>
    ))

    return (
        <Box style={marginTopBottom}>
            <Group justify="space-between">
                <Text fw={700} size="xl">{records?.me!.data.value.name}
                    <Text fw={700}
                          span> ({records?.me?.data.value.user_code} - {((records?.me?.data.value.rating || 0) / 100).toFixed(2)})
                    </Text>
                </Text>

                <Group justify="flex-end" style={{flex: 1}} miw={120}>
                    <Button
                        onClick={() => confirmEditGrade(slst, records!.me!, undefined, records?.modified_b30, onSubmitEditB30)}
                        leftSection={
                            <Icon path={mdiPlus} style={iconMStyle}></Icon>
                        }>增加成绩</Button>
                </Group>
            </Group>

            <Card padding="lg" radius="md" withBorder style={marginTopBottom}>
                <Card.Section p="md">
                    <Text fz="lg" fw={700}>
                        排序方式
                    </Text>
                    <Group style={{marginTop: "1em"}}>
                        {(sortKeys).map((item) => (
                            <Button
                                key={item.key}
                                onClick={() => sortSongDisplay(item.key)}
                                size="xs"
                                variant="light"
                                radius="xl"
                                rightSection={renderSortIndicator(item.key)}
                            >
                                {item.name}
                            </Button>
                        ))}
                    </Group>
                </Card.Section>
                <Card.Section>
                    <Accordion variant="filled" chevronPosition="left">
                        <Accordion.Item value="advanced-filter">
                            <Accordion.Control>筛选设置</Accordion.Control>
                            <Accordion.Panel>
                                <SongFilter onChange={updateFilter}/>
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>
                </Card.Section>
            </Card>

            <Table miw={100}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>曲目</Table.Th>
                        <Table.Th>判定</Table.Th>
                        <Table.Th>分数</Table.Th>
                        <Table.Th>Rating</Table.Th>
                        <Table.Th>操作</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
            <Group justify="center" style={maxWidth}>
                <Button variant="default" ref={lazyLoadBtnRef} onClick={() => updateLoadedRows()}>加载更多</Button>
            </Group>
        </Box>
    );
}

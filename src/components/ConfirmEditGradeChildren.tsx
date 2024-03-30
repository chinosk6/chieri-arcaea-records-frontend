import {B30RetModel, MeRet, SlstItem} from "../utils/models.ts";
import {useForm} from "@mantine/form";
import {Button, ComboboxItem, Group, Image, NumberInput, OptionsFilter, rem, Select} from "@mantine/core";
import {imageResURLFmt} from "../utils/api.ts";
import React, {useEffect, useRef, useState} from "react";
import {getDefaultGrade} from "../utils/presets.ts";
import {
    calcScoreFromHits,
    calcSItemRating,
    calcSongRating,
    calcSongRatingNumber, checkSongInB30List,
    showWarningMessage
} from "../utils/utils.ts";
import {maxWidth} from "../styles.ts";
import {modals} from "@mantine/modals";
import {DateTimePicker} from "@mantine/dates";
import {useTranslation} from "react-i18next";

export default function ConfirmEditGradeChildren({grade, editList, onConfirm, slst, meData}: {grade?: B30RetModel, editList?: B30RetModel[],
    onConfirm?: (newEditedList: B30RetModel[]) => any, slst: SlstItem[], meData: MeRet}) {
    const form = useForm<B30RetModel>({
        initialValues: grade || getDefaultGrade(meData.name, meData.userid)
    })
    const [currentSid, setCurrentSid] = useState(grade?.song_id || "sayonarahatsukoi")
    const [currentDifficulty, setCurrentDifficulty] = useState(grade?.difficulty || 2)
    const [currentSong, setCurrentSong] = useState<SlstItem | null>(null)
    const refreshScoreRef = useRef(false)
    const {t} = useTranslation()

    useEffect(() => {
        for(const i of slst) {
            if (currentSid == i.sid) {
                setCurrentSong(i)
                return
            }
        }
        showWarningMessage(`Song id not found: ${currentSid}.`, "Warning")
    }, [currentSid]);


    useEffect(() => {
        if (refreshScoreRef.current) {
            refreshScoreRef.current = false
            form.setValues({"score": calcScoreFromHits(form.values.shiny_perfect_count, form.values.perfect_count,
                    form.values.near_count, form.values.miss_count)})
        }
    }, [form.values]);

    const optionsFilter: OptionsFilter = ({ options, search }) => {
        const filtered = (options as ComboboxItem[]).filter((option) =>
            option.label.toLowerCase().trim().includes(search.toLowerCase().trim())
        );

        filtered.sort((a, b) => a.label.localeCompare(b.label));
        return filtered;
    }

    const closeModals = () => {
        modals.closeAll()
    }

    const onClickSubmit = (v: B30RetModel) => {
        const newEditedList: B30RetModel[] = editList ? [...editList] : []
        const editPos = checkSongInB30List(v, newEditedList)
        if (editPos < 0) {
            newEditedList.push(v)
        }
        else {
            newEditedList[editPos] = v
        }
        onConfirm?.(newEditedList)
        closeModals()
    }

    return (
        <Group>
            <Group grow>
                <Image src={imageResURLFmt(currentSid, 150, currentDifficulty)} w={rem(140)}/>
                <Group>
                    <Select
                        label={t("songSelect")}
                        placeholder="Select Song"
                        data={slst.map(item => ({
                            value: item.sid,
                            label: item.name_en
                        }))}
                        filter={optionsFilter}
                        searchable
                        disabled={Boolean(grade)}
                        {...form.getInputProps("song_id")}
                        onChange={(e) => {
                            if (!e) e = form.values.song_id
                            setCurrentSid(e)
                            form.getInputProps("song_id").onChange(e)
                        }}
                    />
                    <Select
                        label={t("difficultySelect")}
                        placeholder="Select Difficulty"
                        data={[
                            {
                                value: "0",
                                label: `Past ${(currentSong?.rating_pst || 0) / 10}`,
                                disabled: currentSong?.difficultly_pst == -1
                            },
                            {
                                value: "1",
                                label: `Present ${(currentSong?.rating_prs || 0) / 10}`,
                                disabled: currentSong?.difficultly_prs == -1
                            },
                            {
                                value: "2",
                                label: `Future ${(currentSong?.rating_ftr || 0) / 10}`,
                                disabled: currentSong?.difficultly_ftr == -1
                            },
                            {
                                value: "3",
                                label: `Beyond ${(currentSong?.rating_byn || 0) / 10}`,
                                disabled: currentSong?.difficultly_byn == -1
                            },
                            {
                                value: "4",
                                label: `Eternal ${(currentSong?.rating_etr || 0) / 10}`,
                                disabled: currentSong?.difficultly_etr == -1
                            },
                        ]}
                        disabled={Boolean(grade)}
                        {...form.getInputProps("difficulty")}
                        value={form.getInputProps("difficulty").value.toString()}
                        onChange={(e) => {
                            if (!e) e = form.values.difficulty.toString()
                            setCurrentDifficulty(parseInt(e))
                            form.setValues({"difficulty": parseInt(e)})
                        }}
                    />
                </Group>
            </Group>
            <Group>
                <NumberInput allowNegative={false} allowDecimal={false} thousandSeparator="'"
                             label={`Score (Rating: ${calcSItemRating(currentDifficulty, form.values.score, currentSong)[0]})`}
                             style={maxWidth}
                             {...form.getInputProps("score")} error={form.values.score > 10020000}/>
                <Group grow>
                    <NumberInput allowNegative={false} allowDecimal={false} label="Pure"
                                 {...form.getInputProps("perfect_count")}
                                 onChange={(v) => {
                                     form.getInputProps("perfect_count").onChange(v)
                                     refreshScoreRef.current = true
                                 }}/>
                    <NumberInput allowNegative={false} allowDecimal={false} label="Pure+" max={form.values.perfect_count}
                                 {...form.getInputProps("shiny_perfect_count")}
                                 onChange={(v) => {
                                     form.getInputProps("shiny_perfect_count").onChange(v)
                                     refreshScoreRef.current = true
                                 }}/>
                </Group>
                <Group grow>
                    <NumberInput allowNegative={false} allowDecimal={false} label="Far"
                                 {...form.getInputProps("near_count")}
                                 onChange={(v) => {
                                     form.getInputProps("near_count").onChange(v)
                                     refreshScoreRef.current = true
                                 }}/>
                    <NumberInput allowNegative={false} allowDecimal={false} label="Lost"
                                 {...form.getInputProps("miss_count")}
                                 onChange={(v) => {
                                     form.getInputProps("miss_count").onChange(v)
                                     refreshScoreRef.current = true
                                 }}/>
                </Group>
                <DateTimePicker style={maxWidth} valueFormat="YYYY.MM.DD HH:mm:ss" label={t("timePlayed")} placeholder="Pick date and time"
                                excludeDate={(date) => date > new Date()}
                                value={new Date(form.values.time_played)}
                                onChange={(value) => {
                                    const timeSec = value?.getTime() || new Date().getTime()
                                    form.setValues({time_played: timeSec})
                                }}
                />
            </Group>
            <form onSubmit={form.onSubmit((v) => onClickSubmit(v))} style={maxWidth}>
                <Group justify="flex-end">
                    <Button type="submit">{t("submit")}</Button>
                    <Button color="red" onClick={() => closeModals()}>{t("cancel")}</Button>
                </Group>
            </form>
</Group>
)
}

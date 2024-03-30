import {Grid, MultiSelect, RangeSlider, Text} from "@mantine/core";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";


export function SongFilter({onChange}: {onChange: (difficulty: number[], passStat: string[], ratingRange: [number, number], gradeType: string[]) => any}) {
    const [difficulty, setDifficulty] = useState<string[]>([])
    const [passStat, setPassStat] = useState<string[]>([])
    const [gradeType, setGradeType] = useState<string[]>([])
    const [rating, setRating] = useState<[number, number]>([1, 14])
    const [endRatingRange, setEndRatingRange] = useState<[number, number]>([1, 14])
    const [width, setWidth] = useState(window.innerWidth)
    const {t} = useTranslation()

    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    useEffect(() => {
        onChange(difficulty.map((str) => parseInt(str)), passStat, endRatingRange, gradeType)
    }, [difficulty, passStat, endRatingRange, gradeType]);

    return (
        <Grid>
            <Grid.Col span={width >= 600 ? 4 : 12}>
                <MultiSelect
                    data={[{
                        value: "0",
                        label: "Past",
                    }, {
                        value: "1",
                        label: "Present",
                    }, {
                        value: "2",
                        label: "Future",
                    }, {
                        value: "3",
                        label: "Beyond",
                    }, {
                        value: "4",
                        label: "Eternal",
                    }]}
                    placeholder={t("difficultySelect")}
                    value={difficulty}
                    onChange={(value) => setDifficulty(value)}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 100, timingFunction: 'ease' } }}
                />
            </Grid.Col>

            <Grid.Col span={width >= 600 ? 4 : 12}>
                <MultiSelect
                    data={[{
                        value: "isPM",
                        label: "Pure Memory",
                    }, {
                        value: "isFR",
                        label: "Full Recall",
                    }, {
                        value: "all",
                        label: "All",
                    }]}
                    placeholder={t("songStatus")}
                    value={passStat}
                    onChange={(value) => setPassStat(value)}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 100, timingFunction: 'ease' } }}
                />
            </Grid.Col>

            <Grid.Col span={width >= 600 ? 4 : 12}>
                <MultiSelect
                    data={[{
                        value: "orig",
                        label: t("original"),
                    }, {
                        value: "edited",
                        label: t("edited"),
                    }]}
                    placeholder={t("gradesType")}
                    value={gradeType}
                    onChange={(value) => setGradeType(value)}
                    comboboxProps={{ transitionProps: { transition: 'fade', duration: 100, timingFunction: 'ease' } }}
                />
            </Grid.Col>

            <Grid.Col span={12} mb="md">
                <Text fz="xs" c="dimmed" mb={3}>{t("songRatingRange")}</Text>
                <RangeSlider
                    min={1}
                    max={14}
                    step={0.1}
                    minRange={0.1}
                    precision={1}
                    value={rating}
                    marks={Array.from({ length: 14 }, (_, index) => ({
                        value: index + 1,
                        label: String(index + 1),
                    }))}
                    onChange={setRating}
                    onChangeEnd={setEndRatingRange}
                />
            </Grid.Col>
        </Grid>
    )
}
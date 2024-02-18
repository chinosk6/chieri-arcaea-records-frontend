import {modals} from "@mantine/modals";
import React from "react";
import {B30RetModel, MeRet, SlstItem} from "../../utils/models.ts";
import ConfirmEditGradeChildren from "../ConfirmEditGradeChildren.tsx";



export const confirmEditGrade = (slst: SlstItem[], meData: MeRet, grade?: B30RetModel, editList?: B30RetModel[],
                                 onConfirm?: (newEditedList: B30RetModel[]) => any) => {

    modals.open({
        title: "增加/修改成绩",
        centered: true,
        children: (
            <>
                <ConfirmEditGradeChildren grade={grade} editList={editList} onConfirm={onConfirm} slst={slst} meData={meData}/>
            </>
        )
    })
}

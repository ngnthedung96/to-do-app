"use client";
import React, { useEffect, useState } from "react";
import Filter from "@/components/filter";
import TableData from "@/components/TableData";
import Update from "@/components/update";
import Validate from "@/components/TestValidate";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import {
  NoteStore,
  editIsShowFilteredNote,
  toggleIsFiltered,
} from "@/store/reducer/Notes";
import { editIsShowNote } from "../store/reducer/Notes";

interface NoteType {
  id: number;
  note: string;
  status: number;
  dueDate?: number;
  isShow: number;
  idAssignee: number;
}

export default function Home() {
  // redux
  const { listNote, listFilteredNote, isFilter } = useAppSelector(NoteStore);
  const dispatch = useAppDispatch();
  // state
  const [limit, setLimit] = useState(3);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [currentIdNote, setIdNote] = useState(0);
  const [currentStatus, setStatus] = useState(0);
  const [isEdit, setIsEdit] = useState(false);

  const [defaultNote, setNote] = useState("");
  // select date
  const [startDate, setStartDate] = useState<Date | null>(null);

  useEffect(() => {
    paginationPage();
  }, [limit, isFilter, listFilteredNote.length]);
  function paginationPage() {
    listFilteredNote.map((el: NoteType, index: number) => {
      if (index >= listFilteredNote.length - limit) {
        dispatch(
          editIsShowFilteredNote({
            id: el.id,
            value: 1,
          })
        );
      } else {
        dispatch(
          editIsShowFilteredNote({
            id: el.id,
            value: 0,
          })
        );
      }
    });
    dispatch(toggleIsFiltered(false));
  }

  return (
    <main className="flex min-h-screen flex-row  justify-center p-24">
      <div className="w-full rounded  shadow-lg bg-zinc-50">
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Todo ({listNote.length})</div>
        </div>
        <Filter />
        <Update
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          currentStatus={currentStatus}
          setStatus={setStatus}
          currentIdNote={currentIdNote}
          setIdNote={setIdNote}
          startDate={startDate}
          setStartDate={setStartDate}
          defaultNote={defaultNote}
          setNote={setNote}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
        />

        <TableData
          setNote={setNote}
          setIdNote={setIdNote}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setStartDate={setStartDate}
          setStatus={setStatus}
          setSelectedUserId={setSelectedUserId}
          limit={limit}
          setLimit={setLimit}
        />
        {/* <Validate /> */}
      </div>
    </main>
  );
}

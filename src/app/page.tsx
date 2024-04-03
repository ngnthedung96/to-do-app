"use client";
import React, { useEffect, useState } from "react";
import Filter from "@/components/filter";
import TableData from "@/components/TableData";
import Update from "@/components/update";
import Validate from "@/components/TestValidate";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { NoteStore, fetchListNote } from "@/store/reducer/Notes";

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
  const { dataNotes } = useAppSelector(NoteStore);
  const { listNote, totalNote } = dataNotes;
  const dispatch = useAppDispatch();
  // state
  const [limit, setLimit] = useState(3);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number>(0);
  const [currentIdNote, setIdNote] = useState(0);
  const [currentStatus, setStatus] = useState(0);
  const [isEdit, setIsEdit] = useState(false);

  const [defaultNote, setNote] = useState("");
  // select date
  const [startDate, setStartDate] = useState<Date | null>(null);

  useEffect(() => {
    getList();
  }, [page, limit]);

  async function getList() {
    const data = await dispatch(fetchListNote(`?limit=${limit}&page=${page}`));
  }

  return (
    <main className="flex min-h-screen flex-row  justify-center p-24">
      <div className="w-full rounded  shadow-lg bg-zinc-50">
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Todo ({totalNote})</div>
        </div>
        <Filter limit={limit} page={page} />
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
          setPage={setPage}
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
          page={page}
          setPage={setPage}
        />
      </div>
    </main>
  );
}

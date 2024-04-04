"use client";
import React, { useEffect, useState } from "react";
import Filter from "@/components/filter";
import TableData from "@/components/TableData";
import Update from "@/components/update";
import Validate from "@/components/TestValidate";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { NoteStore, fetchListNote } from "@/store/reducer/Notes";
import { fetchAllUser } from "@/store/reducer/Users";
import moment from "moment";
import { addDays } from "date-fns";
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
  // filter
  const [dateRangeFilter, setDateRangeFilter] = useState<(Date | null)[]>([
    new Date(),
    addDays(new Date(), 5),
  ]);
  const [startDateFilter, endDateFilter] = dateRangeFilter;
  const [currentStatusFilter, setStatusFilter] = useState(0);
  const [searchNote, setSearchNote] = useState("");
  const [searchIdAssignee, setSearchIdAssignee] = useState(0);
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
    getAllUser();
  }, []);

  async function getAllUser() {
    const data = await dispatch(fetchAllUser());
  }

  return (
    <main className="flex min-h-screen flex-row  justify-center p-24">
      <div className="w-full rounded  shadow-lg bg-zinc-50">
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Todo ({totalNote})</div>
        </div>
        <Filter
          limit={limit}
          page={page}
          dateRangeFilter={dateRangeFilter}
          setDateRangeFilter={setDateRangeFilter}
          currentStatusFilter={currentStatusFilter}
          setStatusFilter={setStatusFilter}
          searchNote={searchNote}
          setSearchNote={setSearchNote}
          searchIdAssignee={searchIdAssignee}
          setSearchIdAssignee={setSearchIdAssignee}
          setPage={setPage}
        />
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
          searchNote={searchNote}
          dateRangeFilter={dateRangeFilter}
          currentStatusFilter={currentStatusFilter}
          searchIdAssignee={searchIdAssignee}
        />
      </div>
    </main>
  );
}

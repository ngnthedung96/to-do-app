"use client";
import React, { useEffect, useState } from "react";
import Filter from "@/app/notes/components/filter";
import TableData from "@/app/notes/components/TableData";
import Update from "@/app/notes/components/update";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { NoteStore, fetchData } from "@/store/reducer/Notes";
import { fetchAllUser } from "@/store/reducer/Users";
import moment from "moment";
import axios from "axios";
import { DataNotes, BodyNote, FilterNotes, PagePagination } from "@/interfaces";
import { useRouter } from "next/router";
// next-auth
export default function Notes({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // redux
  const { dataNotes } = useAppSelector(NoteStore);
  const { totalNote } = dataNotes;
  const dispatch = useAppDispatch();
  // filter
  const [filter, setFilter] = useState<FilterNotes>({
    dateRangeFilter: [null, null],
    currentStatusFilter: "",
    searchNote: "",
    searchIdAssignee: [],
    searchUserCreate: [],
  });
  const {
    dateRangeFilter,
    currentStatusFilter,
    searchNote,
    searchIdAssignee,
    searchUserCreate,
  } = filter;
  const [startDateFilter, endDateFilter] = dateRangeFilter;

  // pagination
  const [pagePagination, setPagePagination] = useState<PagePagination>({
    page: 1,
    limit: 3,
  });
  const { page, limit } = pagePagination;
  // status edit / create
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // bodyNote
  const [bodyNote, setBodyNote] = useState<BodyNote>({
    selectedUserId: [],
    currentIdNote: 0,
    currentStatus: "CREATE",
    defaultNote: "",
    startDate: null,
  });

  useEffect(() => {
    getAllUser();
    getListNote();
  }, []);

  async function getAllUser() {
    await dispatch(fetchAllUser());
  }

  async function getListNote() {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      const idProject = searchParams?.idProject;
      if (!idProject) {
        const router = useRouter();
        router.push("/");
        alert("Không tìm thấy dự án");
      }
      let queryString: string = `?limit=${limit}&page=${page}&idProject=${idProject}`;
      if (searchNote) {
        queryString += `&note=${searchNote}`;
      }
      if (startDateFilter && endDateFilter) {
        const startDate = moment(new Date(startDateFilter)).format(
          "DD/MM/YYYY"
        );
        const endDate = moment(new Date(endDateFilter)).format("DD/MM/YYYY");
        queryString += `&dueDate=${startDate}-${endDate}`;
      }
      if (currentStatusFilter) {
        queryString += `&status=${currentStatusFilter}`;
      }
      if (searchIdAssignee.length) {
        queryString += `&arrIdAssignee=${JSON.stringify(searchIdAssignee)}`;
      }
      if (searchUserCreate.length) {
        queryString += `&arrUserCreate=${JSON.stringify(searchUserCreate)}`;
      }
      const response = await axios.get(
        `${process.env.APP_URL}/api/notes` + queryString
      );
      if (!response.data) {
        alert("Có lỗi");
      }
      const {
        error,
        message,
        data,
      }: { error: boolean; message: string; data: DataNotes } = response.data;
      if (!error) {
        dispatch(fetchData(data));
      } else {
        alert(message);
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      const errRes = err.response;
      if (errRes) {
        const errResData = errRes.data;
        if (errResData.message) {
          alert(errResData.message);
        } else {
          alert(errResData);
        }
      }
    }
  }
  return (
    <main className="flex min-h-screen flex-col justify-center p-24">
      <div className="w-full rounded  shadow-lg bg-zinc-50">
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">Todo ({totalNote})</div>
        </div>
        <Filter
          filter={filter}
          setFilter={setFilter}
          pagePagination={pagePagination}
          setPagePagination={setPagePagination}
          getListNote={getListNote}
        />
        <Update
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          bodyNote={bodyNote}
          setBodyNote={setBodyNote}
          setPagePagination={setPagePagination}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          getListNote={getListNote}
        />

        <TableData
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setBodyNote={setBodyNote}
          pagePagination={pagePagination}
          setPagePagination={setPagePagination}
          getListNote={getListNote}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
    </main>
  );
}

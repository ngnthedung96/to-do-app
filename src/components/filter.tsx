"use client";
import React, { useEffect, useState } from "react";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { NoteStore, fetchListNote } from "@/store/reducer/Notes";

interface User {
  id: number;
  name: string;
}
export default function filter({
  limit,
  page,
}: {
  limit: number;
  page: number;
}) {
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
  const { listUser } = useAppSelector(UserStore);

  async function filterDataMethod() {
    let queryString: string = `?limit=${limit}&page=${page}`;
    if (searchNote) {
      queryString += `&note=${searchNote}`;
    }
    if (startDateFilter && endDateFilter) {
      const startDate = moment(new Date(startDateFilter)).format("DD/MM/YYYY");
      const endDate = moment(new Date(endDateFilter)).format("DD/MM/YYYY");
      queryString += `&dueDate=${startDate}-${endDate}`;
    }
    if (Number(currentStatusFilter)) {
      queryString += `&status=${currentStatusFilter}`;
    }
    if (Number(searchIdAssignee)) {
      queryString += `&idAssignee=${searchIdAssignee}`;
    }
    const data = await dispatch(fetchListNote(queryString));
  }
  return (
    <div className="filter-div px-6 pt-4">
      <span>Ngày hết hạn: </span>
      <DatePicker
        placeholderText={"Ngày hết hạn"}
        wrapperClassName="datePicker dateRange"
        selectsRange={true}
        startDate={startDateFilter}
        endDate={endDateFilter}
        onChange={(update: (Date | null)[]) => {
          setDateRangeFilter(update);
        }}
        isClearable={true}
        dateFormat="dd/MM/yyyy"
      />

      <select
        id="select-filter-status"
        className="me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={currentStatusFilter}
        onChange={(e) => setStatusFilter(Number(e.target.value))}
      >
        <option value="0">Chọn trạng thái</option>
        <option value="1">Khởi tạo</option>
        <option value="2">Đang thực hiện</option>
        <option value="3">Đã hoàn thành</option>
      </select>

      <select
        id="select-filter-assignee"
        className="me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={searchIdAssignee}
        onChange={(e) => setSearchIdAssignee(Number(e.target.value))}
      >
        <option value="0">Chọn người thực hiện</option>
        {listUser.map((user: User, index: number) => (
          <option key={index} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        className="me-2 inline-block rounded-e border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-neutral-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-white dark:placeholder:text-neutral-200 dark:autofill:shadow-autofill dark:focus:border-primary"
        placeholder="Ghi chú"
        aria-label="Ghi chú"
        value={searchNote}
        onChange={(e) => setSearchNote(e.target.value)}
        aria-describedby="basic-addon1"
      />
      <button
        onClick={filterDataMethod}
        className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Lọc
      </button>
    </div>
  );
}

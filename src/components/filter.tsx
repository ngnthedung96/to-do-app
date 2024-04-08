"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { User, FilterNotes, PagePagination } from "../interfaces";

export default function filter({
  filter,
  setFilter,
  getListNote,
  pagePagination,
  setPagePagination,
}: {
  filter: FilterNotes;
  setFilter: Function;
  getListNote: Function;
  pagePagination: PagePagination;
  setPagePagination: Function;
}) {
  const { listUser } = useAppSelector(UserStore);
  const { dateRangeFilter, currentStatusFilter, searchNote, searchIdAssignee } =
    filter;
  const [startDateFilter, endDateFilter] = dateRangeFilter;
  const { page, limit } = pagePagination;
  async function filterDataMethod() {
    if (page != 1) {
      setPagePagination((prevValue: PagePagination) => {
        return { ...prevValue, page: 1 };
      });
    } else {
      getListNote();
    }
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
          setFilter((prevValue: FilterNotes) => {
            return { ...prevValue, dateRangeFilter: update };
          });
        }}
        isClearable={true}
        dateFormat="dd/MM/yyyy"
      />

      <select
        id="select-filter-status"
        className="me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={currentStatusFilter}
        onChange={(e) =>
          setFilter((prevValue: FilterNotes) => {
            return {
              ...prevValue,
              currentStatusFilter: e.target.value,
            };
          })
        }
      >
        <option value="">Chọn trạng thái</option>
        <option value="CREATE">Khởi tạo</option>
        <option value="PROCESS">Đang thực hiện</option>
        <option value="DONE">Đã hoàn thành</option>
        <option value="DUEDATE">Đã hết hạn</option>
      </select>
      <select
        id="select-filter-assignee"
        className="me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={searchIdAssignee}
        onChange={(e) =>
          setFilter((prevValue: FilterNotes) => {
            return {
              ...prevValue,
              searchIdAssignee: Number(e.target.value),
            };
          })
        }
      >
        <option value="0">Chọn người thực hiện</option>
        {Array.isArray(listUser) &&
          listUser.map((user: User, index: number) => (
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
        onChange={(e) =>
          setFilter((prevValue: FilterNotes) => {
            return {
              ...prevValue,
              searchNote: e.target.value,
            };
          })
        }
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

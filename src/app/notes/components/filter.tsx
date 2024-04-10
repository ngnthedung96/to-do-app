"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { User, FilterNotes, PagePagination } from "../../../interfaces";
import { Select } from "antd";
import { ProjectUser } from "@prisma/client";

export default function filter({
  filter,
  setFilter,
  getListNote,
  pagePagination,
  setPagePagination,
  idProject,
}: {
  filter: FilterNotes;
  setFilter: Function;
  getListNote: Function;
  pagePagination: PagePagination;
  setPagePagination: Function;
  idProject: number;
}) {
  const { listUser } = useAppSelector(UserStore);
  const {
    dateRangeFilter,
    currentStatusFilter,
    searchNote,
    searchIdAssignee,
    searchUserCreate,
  } = filter;
  const [startDateFilter, endDateFilter] = dateRangeFilter;
  const { page, limit } = pagePagination;

  // function
  async function filterDataMethod() {
    if (page != 1) {
      setPagePagination((prevValue: PagePagination) => {
        return { ...prevValue, page: 1 };
      });
    } else {
      getListNote();
    }
  }
  const handleChange = (value: string[]) => {
    setFilter((prevValue: FilterNotes) => {
      return {
        ...prevValue,
        searchIdAssignee: value,
      };
    });
  };
  function convertListUser(listUser: User[]) {
    const listOpt = listUser.map((user, index) => {
      const projectUsers = user.projectUsers;
      const findedProjectUser: any = projectUsers?.find(
        (projectUser: ProjectUser, index) => projectUser.idProject == idProject
      );
      if (findedProjectUser) {
        return {
          value: findedProjectUser.id,
          label: user.name,
        };
      } else {
        return {
          value: 0,
          label: user.name,
        };
      }
    });
    return listOpt;
  }
  function convertListUserCreate(listUser: User[]) {
    const listOpt = listUser.map((user, index) => {
      return {
        value: user.id,
        label: user.name,
      };
    });
    return listOpt;
  }

  return (
    <div className="filter-div mb-4 px-6 pt-4 grid grid-cols-12 gap-4">
      <div className="filter-date col-span-4">
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
      </div>

      <select
        id="select-filter-status"
        className="col-span-2 me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      <input
        type="text"
        className="col-span-3 me-2 inline-block rounded-e border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-neutral-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-white dark:placeholder:text-neutral-200 dark:autofill:shadow-autofill dark:focus:border-primary"
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
      <Select
        className="col-span-3"
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        placeholder="Chọn người thực hiện"
        defaultValue={searchIdAssignee}
        value={searchIdAssignee}
        onChange={handleChange}
        options={convertListUser(listUser)}
      />
      <Select
        className="col-span-3"
        mode="multiple"
        allowClear
        style={{ width: "100%" }}
        placeholder="Chọn người tạo"
        defaultValue={searchUserCreate}
        value={searchUserCreate}
        onChange={(val: string[]) => {
          setFilter((prevValue: FilterNotes) => {
            return {
              ...prevValue,
              searchUserCreate: val,
            };
          });
        }}
        options={convertListUserCreate(listUser)}
      />

      <button
        onClick={filterDataMethod}
        className="col-span-1 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Lọc
      </button>
    </div>
  );
}

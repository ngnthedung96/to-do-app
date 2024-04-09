"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { Select } from "antd";
import { FilterProjects, User, PagePagination } from "@/interfaces";
export default function filter({
  filter,
  setFilter,
  getListProject,
  pagePagination,
  setPagePagination,
}: {
  filter: FilterProjects;
  setFilter: Function;
  getListProject: Function;
  pagePagination: PagePagination;
  setPagePagination: Function;
}) {
  const { listUser } = useAppSelector(UserStore);
  const { searchProject } = filter;
  const { page, limit } = pagePagination;

  // function
  async function filterDataMethod() {
    if (page != 1) {
      setPagePagination((prevValue: PagePagination) => {
        return { ...prevValue, page: 1 };
      });
    } else {
      getListProject();
    }
  }
  const handleChange = (value: string[]) => {
    setFilter((prevValue: FilterProjects) => {
      return {
        ...prevValue,
        searchIdAssignee: value,
      };
    });
  };
  function convertListUser(listUser: User[]) {
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
      <input
        type="text"
        className="col-span-3 me-2 inline-block rounded-e border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-neutral-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-white dark:placeholder:text-neutral-200 dark:autofill:shadow-autofill dark:focus:border-primary"
        placeholder="Tên dự án"
        aria-label="Dự án"
        value={searchProject}
        onChange={(e) =>
          setFilter((prevValue: FilterProjects) => {
            return {
              ...prevValue,
              searchProject: e.target.value,
            };
          })
        }
        aria-describedby="basic-addon1"
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

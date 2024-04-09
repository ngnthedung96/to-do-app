"use client";
import React, { useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { NoteStore } from "@/store/reducer/Notes";
import { User, NoteType, PagePagination, BodyProject } from "@/interfaces";
import { Select, Space } from "antd";
import type { SelectProps } from "antd";

export default function update({
  isEdit,
  setIsEdit,
  bodyProject,
  setBodyProject,
  setPagePagination,
  isLoading,
  setIsLoading,
  getListProject,
}: {
  isEdit: boolean;
  setIsEdit: Function;
  bodyProject: BodyProject;
  setBodyProject: Function;
  setPagePagination: Function;
  isLoading: boolean;
  setIsLoading: Function;
  getListProject: Function;
}) {
  // redux
  // state
  const { listUser } = useAppSelector(UserStore);
  const { selectedUserId, currentIdProject, defaultProject } = bodyProject;

  // render button
  const renderButton = !isEdit ? (
    <button
      onClick={() => addProjectMethod()}
      className="bg-green-500 me-3 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
    >
      Thêm
    </button>
  ) : (
    <div className="edit-div">
      <button
        onClick={() => editProjectMethod(currentIdProject)}
        className="bg-green-500 me-2 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Lưu
      </button>
      <button
        onClick={() => deleteEdit()}
        className="bg-red-500 me-2 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Hủy
      </button>
    </div>
  );
  // functions
  async function addProjectMethod() {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      if (defaultProject && selectedUserId.length) {
        const newProject: {
          name: string;
          arrIdAssignee: string[];
        } = {
          name: defaultProject,
          arrIdAssignee: selectedUserId,
        };
        const response = await axios.post(
          `${process.env.APP_URL}/api/projects`,
          newProject
        );
        if (!response.data) {
          alert("Có lỗi");
        }
        const {
          error,
          message,
          data,
        }: { error: boolean; message: string; data: NoteType } = response.data;
        if (!error) {
          setPagePagination((prevValue: PagePagination) => {
            return { ...prevValue, page: 1 };
          });
          setBodyProject((prevValue: BodyProject) => {
            return {
              ...prevValue,
              selectedUserId: [],
              currentIdProject: 0,
              defaultProject: "",
            };
          });
          getListProject();
        } else {
          alert(message);
        }
      } else {
        alert("Vui lòng nhập đẩy đủ tên dự án và người tham gia");
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
  async function editProjectMethod(id: number) {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      if (id >= 0 && defaultProject) {
        const newData: {
          id: number;
          name: string;
          arrIdAssignee?: string[];
        } = {
          id,
          name: defaultProject,
          arrIdAssignee: selectedUserId,
        };
        const response = await axios.put(
          `${process.env.APP_URL}/api/projects/` + id,
          newData
        );
        if (!response.data) {
          alert("Có lỗi");
        }
        const {
          error,
          message,
        }: { error: boolean; message: string; data: NoteType } = response.data;

        if (!error) {
          setBodyProject((prevValue: BodyProject) => {
            return {
              ...prevValue,
              selectedUserId: [],
              currentIdProject: 0,
              defaultProject: "",
            };
          });
          setIsEdit(false);
          getListProject();
        } else {
          alert(message);
        }
      } else {
        alert("Vui lòng nhập đẩy đủ tên dự án và người tham gia");
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
  async function deleteEdit() {
    setIsEdit(false);
    setBodyProject((prevValue: BodyProject) => {
      return {
        ...prevValue,
        selectedUserId: [],
        currentIdProject: 0,
        defaultProject: "",
      };
    });
  }
  function convertListUser(listUser: User[]) {
    const listOpt = listUser.map((user, index) => {
      return {
        value: user.id,
        label: user.name,
      };
    });
    return listOpt;
  }
  const handleChange = (value: string[]) => {
    setBodyProject((prevValue: BodyProject) => {
      const newBodyProject = {
        ...prevValue,
        selectedUserId: value,
      };
      return newBodyProject;
    });
  };

  return (
    <div className="px-6 pt-4 pb-2 grid grid-cols-12 gap-4">
      <div className="col-span-10 grid grid-cols-9 gap-4">
        <input
          type="text"
          className="col-span-4 flex-1 inline-block rounded-e border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-neutral-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-white dark:placeholder:text-neutral-200 dark:autofill:shadow-autofill dark:focus:border-primary"
          placeholder="Tên dự án"
          aria-label="Tên dự án"
          value={defaultProject}
          onChange={(e) =>
            setBodyProject((prevValue: BodyProject) => {
              return {
                ...prevValue,
                defaultProject: e.target.value,
              };
            })
          }
          aria-describedby="basic-addon1"
        />
        <Select
          className="col-span-4"
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Chọn người thực hiện"
          defaultValue={selectedUserId}
          value={selectedUserId}
          onChange={handleChange}
          options={convertListUser(listUser)}
        />
      </div>
      <div className="col-span-2">{renderButton}</div>
    </div>
  );
}

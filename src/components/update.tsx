"use client";
import React, { useEffect } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { NoteStore, addNote, editNote } from "../store/reducer/Notes";
import { User, NoteType, PagePagination, BodyNote } from "../interfaces";
import { Select, Space } from "antd";
import type { SelectProps } from "antd";

export default function update({
  isEdit,
  setIsEdit,
  bodyNote,
  setBodyNote,
  setPagePagination,
  isLoading,
  setIsLoading,
  getListNote,
}: {
  isEdit: boolean;
  setIsEdit: Function;
  bodyNote: BodyNote;
  setBodyNote: Function;
  setPagePagination: Function;
  isLoading: boolean;
  setIsLoading: Function;
  getListNote: Function;
}) {
  // redux
  // state
  const { listUser } = useAppSelector(UserStore);
  const { dataNotes } = useAppSelector(NoteStore);
  const { listNote } = dataNotes;
  const {
    selectedUserId,
    currentIdNote,
    currentStatus,
    defaultNote,
    startDate,
  } = bodyNote;

  const dispatch = useAppDispatch();

  // render button
  const renderButton = !isEdit ? (
    <button
      onClick={() => addNoteMethod()}
      className="bg-green-500 me-3 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
    >
      Thêm
    </button>
  ) : (
    <div className="edit-div">
      <button
        onClick={() => editNoteMethod(currentIdNote, startDate, currentStatus)}
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
  async function addNoteMethod() {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      if (defaultNote && selectedUserId.length && currentStatus) {
        const newNote: {
          note: string;
          arrIdAssignee: string[];
          dueDate: number;
          status: string;
        } = {
          note: defaultNote,
          arrIdAssignee: selectedUserId,
          dueDate: startDate ? moment(new Date(startDate)).unix() : 0,
          status: currentStatus,
        };
        const response = await axios.post(
          `${process.env.APP_URL}/api/notes`,
          newNote
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
          setBodyNote((prevValue: BodyNote) => {
            return {
              ...prevValue,
              defaultNote: "",
              startDate: null,
              currentStatus: "CREATE",
              selectedUserId: [],
            };
          });
          getListNote();
        } else {
          alert(message);
        }
      } else {
        alert("Vui lòng nhập đẩy đủ ghi chú và người thực hiện");
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
  async function editNoteMethod(
    id: number,
    dueDate: Date | null,
    status: string
  ) {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      if (id >= 0 && defaultNote) {
        const dateUnix = dueDate ? moment(new Date(dueDate)).unix() : 0;
        const newData: {
          id: number;
          note: string;
          arrIdAssignee?: string[];
          dueDate: number;
          status: string;
        } = {
          id,
          note: defaultNote,
          arrIdAssignee: selectedUserId,
          dueDate: dateUnix,
          status,
        };
        const response = await axios.put(
          `${process.env.APP_URL}/api/notes/` + id,
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
          setBodyNote((prevValue: BodyNote) => {
            return {
              ...prevValue,
              currentIdNote: 0,
              defaultNote: "",
              startDate: null,
              currentStatus: "CREATE",
              selectedUserId: [],
            };
          });
          setIsEdit(false);
          getListNote();
        } else {
          alert(message);
        }
      } else {
        alert("Vui lòng nhập đẩy đủ ghi chú");
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
    setBodyNote((prevValue: BodyNote) => {
      return {
        ...prevValue,
        defaultNote: "",
        selectedUserId: [],
        startDate: null,
        currentIdNote: 0,
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
    setBodyNote((prevValue: BodyNote) => {
      const newBodyNote = {
        ...prevValue,
        selectedUserId: value,
      };
      return newBodyNote;
    });
  };

  return (
    <div className="px-6 pt-4 pb-2 grid grid-cols-12 gap-4">
      <div className="col-span-10 grid grid-cols-9 gap-4">
        <input
          type="text"
          className="col-span-3 flex-1 inline-block rounded-e border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-neutral-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-white dark:placeholder:text-neutral-200 dark:autofill:shadow-autofill dark:focus:border-primary"
          placeholder="Ghi chú"
          aria-label="Ghi chú"
          value={defaultNote}
          onChange={(e) =>
            setBodyNote((prevValue: BodyNote) => {
              return {
                ...prevValue,
                defaultNote: e.target.value,
              };
            })
          }
          aria-describedby="basic-addon1"
        />
        <DatePicker
          placeholderText={"Ngày hết hạn"}
          wrapperClassName="datePicker col-span-1"
          selected={startDate}
          onChange={(date: Date | null) => {
            setBodyNote((prevValue: BodyNote) => {
              return {
                ...prevValue,
                startDate: date ? date : null,
              };
            });
          }}
          showTimeSelect
          dateFormat="HH:mm dd/MM/yyyy"
        />
        <select
          id="select-status"
          className="col-span-2 me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={currentStatus}
          onChange={(e) =>
            setBodyNote((prevValue: BodyNote) => {
              return {
                ...prevValue,
                currentStatus: e.target.value,
              };
            })
          }
        >
          <option value="">Chọn trạng thái</option>
          <option value="CREATE">Khởi tạo</option>
          <option value="PROCESS">Đang thực hiện</option>
          <option value="DONE">Đã hoàn thành</option>
        </select>
        <Select
          className="col-span-2"
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

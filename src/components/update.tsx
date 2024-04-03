"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { produce } from "immer";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import {
  editNote,
  addNote,
  NoteStore,
  addFilteredNote,
  editFilteredNote,
  resetFilteredNote,
} from "../store/reducer/Notes";

interface NoteType {
  id: number;
  note: string;
  status: number;
  dueDate?: number;
  isShow: number;
  idAssignee: number;
}

interface User {
  id: number;
  name: string;
}
export default function update({
  isEdit,
  setIsEdit,
  currentStatus,
  setStatus,
  currentIdNote,
  setIdNote,
  startDate,
  setStartDate,
  defaultNote,
  setNote,
  selectedUserId,
  setSelectedUserId,
}: {
  isEdit: boolean;
  setIsEdit: Function;
  currentStatus: number;
  setStatus: Function;
  currentIdNote: number;
  setIdNote: Function;
  startDate: Date | null;
  setStartDate: Function;
  defaultNote: string;
  setNote: Function;
  selectedUserId: number;
  setSelectedUserId: Function;
}) {
  // redux
  // state
  const { listUser } = useAppSelector(UserStore);
  const { listNote, listFilteredNote } = useAppSelector(NoteStore);

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
      <select
        id="select-status"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={currentStatus}
        onChange={(e) => setStatus(Number(e.target.value))}
      >
        <option value="0">Chọn trạng thái</option>
        <option value="1">Khởi tạo</option>
        <option value="2">Đang thực hiện</option>
        <option value="3">Đã hoàn thành</option>
      </select>
      <button
        onClick={() => editNoteMethod(currentIdNote, startDate, currentStatus)}
        className="bg-green-500 me-3 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Lưu
      </button>
    </div>
  );
  // functions
  function addNoteMethod(): void {
    if (defaultNote && Number(selectedUserId)) {
      const newNote: NoteType = {
        id: 0,
        note: defaultNote,
        status: 1,
        dueDate: startDate ? moment(new Date(startDate)).unix() : 0,
        isShow: 1,
        idAssignee: selectedUserId,
      };
      newNote.id = listNote.length + 1;
      dispatch(addNote(newNote));
      dispatch(resetFilteredNote());
      setNote("");
      setStartDate(null);
      setSelectedUserId(0);
    } else {
      alert("Vui lòng nhập đẩy đủ ghi chú và người thực hiện");
    }
  }
  function editNoteMethod(
    id: number,
    dueDate: Date | null,
    status: number
  ): void {
    if (id >= 0 && defaultNote) {
      dispatch(
        editNote({
          id,
          dueDate,
          status,
          defaultNote,
          selectedUserId,
        })
      );
      dispatch(
        editFilteredNote({
          id,
          dueDate,
          status,
          defaultNote,
          selectedUserId,
        })
      );
      setNote("");
      setStatus(-1);
      setIsEdit(false);
      setStartDate(null);
      setSelectedUserId(0);
      setIdNote(-1);
    } else {
      alert("Vui lòng nhập đẩy đủ ghi chú");
    }
  }
  function checkValueSelectAssignee() {
    if (selectedUserId > 0) {
      return selectedUserId;
    } else if (currentIdNote > 0) {
      const note: NoteType | undefined = listFilteredNote.find((el, val) => {
        return el.id == currentIdNote;
      });
      return note?.idAssignee;
    } else {
      return 0;
    }
  }
  return (
    <div className="px-6 pt-4 pb-2 flex">
      <input
        type="text"
        className="flex-1 inline-block rounded-e border border-solid border-neutral-200 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-surface outline-none transition duration-200 ease-in-out placeholder:text-neutral-500 focus:z-[3] focus:border-primary focus:shadow-inset focus:outline-none motion-reduce:transition-none dark:border-white/10 dark:text-white dark:placeholder:text-neutral-200 dark:autofill:shadow-autofill dark:focus:border-primary"
        placeholder="Ghi chú"
        aria-label="Ghi chú"
        value={defaultNote}
        onChange={(e) => setNote(e.target.value)}
        aria-describedby="basic-addon1"
      />
      <DatePicker
        placeholderText={"Ngày hết hạn"}
        wrapperClassName="datePicker "
        selected={startDate}
        onChange={(date: Date | null) => {
          if (date) {
            return setStartDate(date);
          } else {
            return setStartDate(null);
          }
        }}
        showTimeSelect
        dateFormat="HH:mm dd/MM/yyyy"
      />
      <select
        id="select-assignee"
        className="me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        value={checkValueSelectAssignee()}
        onChange={(e) => setSelectedUserId(Number(e.target.value))}
      >
        <option value="0">Chọn người thực hiện</option>
        {listUser.map((user: User, index: number) => (
          <option key={index} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
      {renderButton}
    </div>
  );
}
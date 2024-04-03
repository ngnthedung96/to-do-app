"use client";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { NoteStore, deleteFilteredNote } from "@/store/reducer/Notes";
import { deleteNote, editIsShowFilteredNote } from "../store/reducer/Notes";

// status 1,2,3

interface NoteType {
  id: number;
  note: string;
  status: number;
  dueDate?: number;
  isShow: number;
  idAssignee: number;
}

export default function tableData({
  setNote,
  setIdNote,
  setIsEdit,
  setStartDate,
  isEdit,
  setStatus,
  setSelectedUserId,
  limit,
  setLimit,
}: {
  setNote: Function;
  setIdNote: Function;
  isEdit: boolean;
  setIsEdit: Function;
  setStartDate: Function;
  setStatus: Function;
  setSelectedUserId: Function;
  limit: number;
  setLimit: Function;
}) {
  // redux state
  const { listUser } = useAppSelector(UserStore);
  const { listNote, listFilteredNote } = useAppSelector(NoteStore);
  const dispatch = useAppDispatch();
  // functions
  function getAssignee(id: number) {
    const user = listUser.find((user, i) => {
      return user.id == id;
    });
    return user;
  }
  function deleteNoteMethod(id: number) {
    dispatch(deleteNote(id));
    dispatch(deleteFilteredNote(id));
    setNote("");
    if (isEdit) {
      setIsEdit(false);
    }
  }
  function convertStatusText(status: number) {
    if (status == 1) {
      return "Khởi tạo";
    } else if (status == 2) {
      return "Đang thực hiện";
    } else if (status == 3) {
      return "Đã hoàn thành";
    }
  }
  function nextPage() {
    const duplicateArr = JSON.parse(JSON.stringify(listFilteredNote));
    const reverseNotes = duplicateArr.reverse();
    const indexLastShowNote = reverseNotes.findLastIndex((el: NoteType) => {
      return el.isShow;
    });
    if (indexLastShowNote < listFilteredNote.length - 1) {
      reverseNotes.map((el: NoteType, index: number) => {
        const endIndex = indexLastShowNote + limit;
        if (index > indexLastShowNote && index <= endIndex) {
          dispatch(
            editIsShowFilteredNote({
              id: el.id,
              value: 1,
            })
          );
        } else {
          dispatch(
            editIsShowFilteredNote({
              id: el.id,
              value: 0,
            })
          );
        }
      });
    }
  }
  function previousPage() {
    const duplicateArr = JSON.parse(JSON.stringify(listFilteredNote));
    const reverseNotes = duplicateArr.reverse();
    const indexFirstShowNote = reverseNotes.findIndex((el: NoteType) => {
      return el.isShow;
    });
    if (indexFirstShowNote > 0) {
      reverseNotes.map((el: NoteType, index: number) => {
        const endIndex = indexFirstShowNote - limit;
        if (index < indexFirstShowNote && index >= endIndex) {
          dispatch(
            editIsShowFilteredNote({
              id: el.id,
              value: 1,
            })
          );
        } else {
          dispatch(
            editIsShowFilteredNote({
              id: el.id,
              value: 0,
            })
          );
        }
      });
    }
  }

  return (
    <div className="px-6 pt-4 pb-2">
      <div className="relative overflow-x-auto">
        <select
          id="select-assignee"
          className="float float-right me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Ghi chú
              </th>
              <th scope="col" className="px-6 py-3">
                Người thực hiện
              </th>
              <th scope="col" className="px-6 py-3">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3">
                Ngày hoàn thành
              </th>
              <th scope="col" className="px-6 py-3">
                Quản lý
              </th>
            </tr>
          </thead>
          <tbody>
            {[...listFilteredNote]
              .reverse()
              .map((noteObj: NoteType, index: number) =>
                noteObj.isShow ? (
                  <tr
                    key={index}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {noteObj.note}
                    </td>
                    <td
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {getAssignee(noteObj.idAssignee)?.name}
                    </td>
                    <td className="px-6 py-4">
                      {convertStatusText(noteObj.status)}
                    </td>
                    <td className="px-6 py-4">
                      {noteObj.dueDate
                        ? moment
                            .unix(noteObj.dueDate)
                            .format("DD/MM/YYYY HH:mm")
                        : ""}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setIsEdit(true);
                          setNote(noteObj.note);
                          setStatus(noteObj.status);
                          if (noteObj.dueDate) {
                            setStartDate(
                              new Date(
                                moment
                                  .unix(noteObj.dueDate)
                                  .format("YYYY/MM/DD HH:mm")
                              )
                                ? new Date(
                                    moment
                                      .unix(noteObj.dueDate)
                                      .format("YYYY/MM/DD HH:mm")
                                  )
                                : null
                            );
                          }
                          setIdNote(noteObj.id);
                          setSelectedUserId(0);
                        }}
                        className="bg-blue-500 me-3 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => deleteNoteMethod(noteObj.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={index}></tr>
                )
              )}
          </tbody>
        </table>

        <nav aria-label="Page navigation example" className="float float-right">
          <ul className="flex items-center -space-x-px h-8 text-sm">
            <li onClick={previousPage}>
              <span className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                <span className="sr-only">Previous</span>
                <svg
                  className="w-2.5 h-2.5 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 1 1 5l4 4"
                  />
                </svg>
              </span>
            </li>
            <li onClick={nextPage}>
              <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                <span className="sr-only">Next</span>
                <svg
                  className="w-2.5 h-2.5 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 6 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

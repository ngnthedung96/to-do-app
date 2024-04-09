"use client";
import React, { useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { UserStore } from "@/store/reducer/Users";
import { NoteStore, deleteNote } from "@/store/reducer/Notes";
import { PagePagination, NoteType, BodyNote } from "../../../interfaces";
import { User } from "next-auth";
import { Pagination, PaginationProps } from "antd";
export default function tableData({
  setIsEdit,
  isEdit,
  setBodyNote,
  pagePagination,
  setPagePagination,
  getListNote,
  isLoading,
  setIsLoading,
}: {
  isEdit: boolean;
  setIsEdit: Function;
  setBodyNote: Function;
  pagePagination: PagePagination;
  setPagePagination: Function;
  getListNote: Function;
  isLoading: boolean;
  setIsLoading: Function;
}) {
  // redux state
  const { listUser } = useAppSelector(UserStore);
  const { dataNotes } = useAppSelector(NoteStore);
  const { listNote, totalNote } = dataNotes;
  const dispatch = useAppDispatch();
  // state
  const { page, limit } = pagePagination;
  // functions
  function getAssignee(note: NoteType) {
    let userName = null;
    const { id, noteUsers } = note;
    if (noteUsers) {
      for (let noteUser of noteUsers) {
      }
    }
    return userName;
  }
  async function deleteNoteMethod(id: number) {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      const response = await axios.delete(
        `${process.env.APP_URL}/api/notes/` + id
      );
      if (!response.data) {
        alert("Có lỗi");
      }
      const {
        error,
        message,
      }: { error: boolean; message: string; data: NoteType } = response.data;
      if (!error) {
        dispatch(deleteNote(id));
        setBodyNote((prevValue: BodyNote) => {
          return {
            ...prevValue,
            defaultNote: "",
          };
        });
        if (isEdit) {
          setIsEdit(false);
        }
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
  function convertStatusText(status: string) {
    if (status == "CREATE") {
      return "Khởi tạo";
    } else if (status == "PROCESS") {
      return "Đang thực hiện";
    } else if (status == "DONE") {
      return "Đã hoàn thành";
    }
  }
  const changePagination: PaginationProps["onChange"] = (pageAntd) => {
    setPagePagination((prevValue: object) => {
      return { ...prevValue, page: pageAntd };
    });
  };
  function getUserFromNotes(note: NoteType) {
    const { noteUsers } = note;
    if (Array.isArray(noteUsers)) {
      return noteUsers.map(
        (
          noteUser: {
            idUser: number;
            user: User;
          },
          index
        ) => {
          return noteUser.idUser;
        }
      );
    }
  }
  useEffect(() => {
    getListNote();
  }, [page, limit]);

  return (
    <div className="px-6 pt-4 pb-2">
      <div
        className={isLoading ? "opacity-20" : "" + "relative overflow-x-auto"}
      >
        <select
          id="select-assignee"
          className="float float-right me-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={limit}
          onChange={(e) =>
            setPagePagination((prevValue: PagePagination) => {
              return { page: 1, limit: Number(e.target.value) };
            })
          }
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
                Tạo bởi
              </th>
              <th scope="col" className="px-6 py-3">
                Quản lý
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(listNote) &&
              [...listNote].map((noteObj: NoteType, index: number) => (
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
                    {noteObj.noteUsers &&
                      noteObj.noteUsers.map((noteUser: any, ind) => (
                        <span key={ind} className="block">
                          {noteUser?.projectUsers?.user.name}
                        </span>
                      ))}
                  </td>
                  <td className="px-6 py-4">
                    {convertStatusText(noteObj.status)}
                  </td>
                  <td
                    className={
                      noteObj.status != "DONE" &&
                      noteObj.dueDate &&
                      noteObj.dueDate < moment().unix()
                        ? "text-red-500"
                        : ""
                    }
                  >
                    {noteObj.dueDate
                      ? moment.unix(noteObj.dueDate).format("DD/MM/YYYY HH:mm")
                      : ""}
                  </td>
                  <td className="px-6 py-4">{noteObj?.userCreate?.name}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        if (!isLoading) {
                          setIsEdit(true);
                          setBodyNote((prevValue: BodyNote) => {
                            return {
                              ...prevValue,
                              defaultNote: noteObj.note,
                              startDate: noteObj.dueDate
                                ? new Date(
                                    moment
                                      .unix(noteObj.dueDate)
                                      .format("YYYY/MM/DD HH:mm")
                                  )
                                : null,
                              currentIdNote: noteObj.id,
                              currentStatus: noteObj.status,
                              selectedUserId: getUserFromNotes(noteObj),
                            };
                          });
                        }
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
              ))}
          </tbody>
        </table>
        <Pagination
          current={page}
          onChange={changePagination}
          total={totalNote}
          pageSize={limit}
        />
      </div>
      <div
        className={
          !isLoading
            ? "hidden"
            : "" + "absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2"
        }
        role="status"
      >
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

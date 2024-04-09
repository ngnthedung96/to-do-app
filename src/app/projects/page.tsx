"use client";
import React, { useEffect, useState } from "react";
import TableData from "./components/TableData";
import Filter from "./components/filter";
import Update from "./components/update";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { ProjectStore, fetchData } from "@/store/reducer/Projects";
import { fetchAllUser } from "@/store/reducer/Users";
import moment from "moment";
import axios from "axios";
import {
  DataProjects,
  PagePagination,
  FilterProjects,
  BodyProject,
} from "@/interfaces";
// next-auth
export default function Projects() {
  // redux
  const { dataProjects } = useAppSelector(ProjectStore);
  const { totalProject } = dataProjects;
  const dispatch = useAppDispatch();
  // filter
  const [filter, setFilter] = useState<FilterProjects>({
    searchProject: "",
  });
  const { searchProject } = filter;

  // pagination
  const [pagePagination, setPagePagination] = useState<PagePagination>({
    page: 1,
    limit: 3,
  });
  const { page, limit } = pagePagination;
  // status edit / create
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // bodyProject
  const [bodyProject, setBodyProject] = useState<BodyProject>({
    selectedUserId: [],
    currentIdProject: 0,
    defaultProject: "",
  });

  useEffect(() => {
    getAllUser();
  }, []);

  async function getAllUser() {
    await dispatch(fetchAllUser());
  }

  async function getListProject() {
    try {
      if (isLoading) {
        return;
      }
      setIsLoading(true);
      let queryString: string = `?limit=${limit}&page=${page}`;
      if (searchProject) {
        queryString += `&project=${searchProject}`;
      }
      const response = await axios.get(
        `${process.env.APP_URL}/api/projects` + queryString
      );
      if (!response.data) {
        alert("Có lỗi");
      }
      const {
        error,
        message,
        data,
      }: { error: boolean; message: string; data: DataProjects } =
        response.data;
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
    <div className="w-full rounded  shadow-lg bg-zinc-50">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">Projects ({totalProject})</div>
      </div>
      <Filter
        filter={filter}
        setFilter={setFilter}
        pagePagination={pagePagination}
        setPagePagination={setPagePagination}
        getListProject={getListProject}
      />
      <Update
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        bodyProject={bodyProject}
        setBodyProject={setBodyProject}
        setPagePagination={setPagePagination}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        getListProject={getListProject}
      />

      <TableData
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setBodyProject={setBodyProject}
        pagePagination={pagePagination}
        setPagePagination={setPagePagination}
        getListProject={getListProject}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </div>
  );
}

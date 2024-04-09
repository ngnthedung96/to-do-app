import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { DataProjects, ProjectType } from "@/interfaces";

export interface ProjectState {
  dataProjects: DataProjects;
}
// Define a type for the slice state
export const initialState: ProjectState = {
  dataProjects: {
    totalProject: 0,
    listProject: [],
  },
};

const Projects = createSlice({
  name: "Projects",
  initialState,
  reducers: {
    fetchData(state, action: PayloadAction<DataProjects>) {
      const data = action.payload;
      state.dataProjects = data;
    },
    addProject(state, action: PayloadAction<ProjectType>) {
      const data = action.payload;
      state.dataProjects.listProject.unshift(data);
      state.dataProjects.listProject.splice(-1);
      state.dataProjects.totalProject++;
    },
    editProject(state, action: PayloadAction<ProjectType>) {
      const newData = action.payload;
      const idNew = newData.id;
      const { listProject } = state.dataProjects;
      const indexProject = listProject.findIndex((el, index) => {
        return el.id == idNew;
      });
      listProject[indexProject] = newData;
    },
    deleteProject(state, action: PayloadAction<number>) {
      const id = action.payload;
      const { listProject } = state.dataProjects;
      const indexProject = listProject.findIndex((el, index) => {
        return el.id == id;
      });
      listProject.splice(indexProject, 1);
      state.dataProjects.totalProject--;
    },
  },
});

export const ProjectStore = (state: RootState) => state.Projects; // get state
export const { fetchData, addProject, editProject, deleteProject } =
  Projects.actions;
export default Projects.reducer;

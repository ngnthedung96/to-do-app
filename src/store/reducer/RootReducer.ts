import { combineReducers } from "@reduxjs/toolkit";
import Users from "./Users";
import Notes from "./Notes";
import Projects from "./Projects";

export const rootReducer = combineReducers({
  Users,
  Notes,
  Projects,
});

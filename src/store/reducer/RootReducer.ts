import { combineReducers } from "@reduxjs/toolkit";
import Users from "./Users";
import Notes from "./Notes";

export const rootReducer = combineReducers({
  Users,
  Notes,
});

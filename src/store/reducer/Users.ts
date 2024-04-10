import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";
import { User } from "@/interfaces";
// Define a type for the slice state
interface userState {
  listUser: User[];
}

export const initialState: userState = {
  listUser: [],
};

const Users = createSlice({
  name: "Users",
  initialState,
  reducers: {
    fetchDataUser(state, action: PayloadAction<User[]>) {
      const data = action.payload;
      state.listUser = data;
    },
  },
});

export const UserStore = (state: RootState) => state.Users; // get state
export const { fetchDataUser } = Users.actions;
export default Users.reducer;

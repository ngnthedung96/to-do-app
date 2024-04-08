import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";
import { User } from "@/interfaces";
// Define a type for the slice state
interface userState {
  listUser: User[];
}
export const fetchAllUser = createAsyncThunk(
  "notes/getAllUser",
  async (payload, thunkAPI) => {
    try {
      const response = await axios.get(`${process.env.APP_URL}/api/users/`);
      return response;
    } catch (err: any) {
      return err.response;
    }
  }
);
export const initialState: userState = {
  listUser: [],
};

const Users = createSlice({
  name: "Users",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(fetchAllUser.fulfilled, (state, action) => {
      const response = action.payload;
      const {
        error,
        message,
        data,
      }: { error: boolean; message: string; data: User[] } = response.data;
      if (!error) {
        state.listUser = data;
      } else {
        alert(message);
      }
    });
  },
});

export const UserStore = (state: RootState) => state.Users; // get state
export default Users.reducer;

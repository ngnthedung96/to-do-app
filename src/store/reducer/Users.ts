import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
// Define a type for the slice state
interface initialState {
  listUser: User[]
}
interface User{
  id:number,
  name:string
}

export const initialState:initialState = {
  listUser: [
    {
      id:1,
      name:"a"
    },
    {
      id:2,
      name:"b"
    },
    {
      id:3,
      name:"c"
    },
    {
      id:4,
      name:"d"
    },
  ],
};

const Users = createSlice({
  name: "Users",
  initialState,
  reducers: {
   
  },
  extraReducers: (builder) => {
  }
});

export const UserStore = (state: RootState) => state.Users; // get state
export default Users.reducer;

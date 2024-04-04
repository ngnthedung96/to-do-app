import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";
// Define a type for the slice state
interface initialState {
  listUser: User[]
}
interface User{
  id:number,
  name:string
}
const apiUrl =  process.env.NODE_ENV == "production"?"https://to-do-4z1k9iq89-ngnthedungs-projects.vercel.app":"http://localhost:3000"
export const fetchAllUser = createAsyncThunk(
  'notes/getAllUser',
  async (payload,thunkAPI) => {
    try{
      const response = await axios.get(`${apiUrl}/api/users/get-all`)
      return response
    }catch(err:any){
      return err.response
    }
  },
)
export const initialState:initialState = {
  listUser: [
    
  ],
};

const Users = createSlice({
  name: "Users",
  initialState,
  reducers: {
   
  },
  
  extraReducers: (builder) => {
    builder.addCase(fetchAllUser.fulfilled, (state, action) => {
      const response = action.payload
      const {error,message, data}:{error:boolean,message:string,data:User[]} = response.data
      if(!error){
        state.listUser = data
      }else{
        alert(message)
      }
    })
  }
});

export const UserStore = (state: RootState) => state.Users; // get state
export default Users.reducer;

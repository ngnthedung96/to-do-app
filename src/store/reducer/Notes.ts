import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { produce } from "immer";
import moment from "moment";
import axios from "axios";
// Define a type for the slice state
interface dataNotes {
  totalNote:number,
  listNote:NoteType[],
}
interface initialState {
  dataNotes:dataNotes,
}
interface NoteType {
  id: number;
  note: string;
  status: number;
  dueDate?: number;
  idAssignee: number;
}
const apiUrl =  process.env.NODE_ENV == "production"?"https://to-do-4z1k9iq89-ngnthedungs-projects.vercel.app":"http://localhost:3000"
export const initialState:initialState = {
  dataNotes: {
    totalNote:0,
    listNote:[
    ],
  },
};
export const fetchListNote = createAsyncThunk(
  'notes/getListNote',
  async (queryString: string, thunkAPI) => {
    try{
      const response = await axios.get(`${apiUrl}/api/notes/get-list` + queryString)
      return response
    }catch(err:any){
      return err.response
    }
  },
)
export const addNote = createAsyncThunk(
  'notes/addNote',
  async (requestBody: {note:string, idAssignee:number, dueDate?:number}, thunkAPI) => {
    try{
      const response = await axios.post(`${apiUrl}/api/notes`,requestBody)
      return response
    }catch(err:any){
      return err.response
    }
  },
)
export const editNote = createAsyncThunk(
  'notes/editNote',
  async (requestBody: {id:number,note:string, idAssignee:number, dueDate?:number, status:number}, thunkAPI) => {
    try{
      const {id,
        note,
        idAssignee,
        dueDate,
        status} = requestBody
      const response = await axios.put(`${apiUrl}/api/notes/` + id,{
        note,
        idAssignee,
        dueDate,
        status
      })
      return{newData:requestBody, response} 
    }
    catch(err:any){
      return err.response
    }
    
  },
)
export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id: number, thunkAPI) => {
    try{
      const response = await axios.delete(`${apiUrl}/api/notes/` + id)
      return {id,responseData:response}
    } 
    catch(err:any){
      return err.response
    }
  },
)
const Notes = createSlice({
  name: "Notes",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    // fetch data
    builder.addCase(fetchListNote.fulfilled, (state, action) => {
      const response = action.payload
      const {error,message, data}:{error:boolean,message:string,data:dataNotes} = response.data
      if(!error){
        state.dataNotes = data
      }else{
        alert(message)
      }
    })
    // add data
    builder.addCase(addNote.fulfilled, (state, action) => {
      const response = action.payload
      const {error,message, data}:{error:boolean,message:string,data:NoteType} = response.data
      if(!error){
        state.dataNotes.listNote.unshift(data)
        state.dataNotes.listNote.splice(-1)
        state.dataNotes.totalNote++
      }else{
        alert(message)
      }
    })
    // edit data
    builder.addCase(editNote.fulfilled, (state, action) => {
      const {response,newData} = action.payload
      const {error,message, data}:{error:boolean,message:string,data:NoteType} = response.data
      if(!error){
        const idNew = newData.id
        const {listNote} = state.dataNotes
        const indexNote = listNote.findIndex((el,index)=>{return el.id == idNew})
        listNote[indexNote] = newData
      }else{
        alert(message)
      }
    })
    // delete data
    builder.addCase(deleteNote.fulfilled, (state, action) => {
      const response = action.payload
      const {id,responseData} = response
      const {error,message}:{error:boolean,message:string} = responseData.data
      if(!error){
        const {listNote} = state.dataNotes
        const indexNote = listNote.findIndex((el,index)=>{return el.id == id})
        listNote.splice(indexNote,1)
        state.dataNotes.totalNote--
      }else{
        alert(message)
      }
    })
  },
});

export const NoteStore = (state: RootState) => state.Notes; // get state
export default Notes.reducer;

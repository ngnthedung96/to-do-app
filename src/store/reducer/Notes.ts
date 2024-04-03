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

export const initialState:initialState = {
  dataNotes: {
    totalNote:0,
    listNote:[
      {id:1,
      note:"",
      status:1,
      idAssignee:1,
    }
    ],
  },
};
export const fetchListNote = createAsyncThunk(
  'notes/getListNote',
  async (queryString: string, thunkAPI) => {
    const response = await axios.get("http://localhost:3000/api/notes/get-list" + queryString)
    return response.data
  },
)
export const addNote = createAsyncThunk(
  'notes/addNote',
  async (requestBody: {note:string, idAssignee:number, dueDate?:number}, thunkAPI) => {
    const response = await axios.post("http://localhost:3000/api/notes",requestBody)
    return response.data
  },
)
export const editNote = createAsyncThunk(
  'notes/editNote',
  async (requestBody: {id:number,note:string, idAssignee:number, dueDate?:number, status:number}, thunkAPI) => {
    const {id,
      note,
      idAssignee,
      dueDate,
      status} = requestBody
    const response = await axios.put("http://localhost:3000/api/notes/" + id,{
      note,
      idAssignee,
      dueDate,
      status
    })
    return response.data
  },
)
export const deleteNote = createAsyncThunk(
  'notes/editNote',
  async (id: number, thunkAPI) => {
    const response = await axios.delete("http://localhost:3000/api/notes/" + id)
    return response.data
  },
)
const Notes = createSlice({
  name: "Notes",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(fetchListNote.fulfilled, (state, action) => {
      const response = action.payload
      const data:dataNotes = response.data
      if(data){
        state.dataNotes = data
      }
    })
    builder.addCase(addNote.fulfilled, (state, action) => {
      const response = action.payload
      const data:NoteType = response.data
      state.dataNotes.listNote.unshift(data)
      state.dataNotes.listNote.splice(-1)
    })
    builder.addCase(editNote.fulfilled, (state, action) => {
      const response = action.payload
      const data:NoteType = response.data
      const idNew = data.id
      const {listNote} = state.dataNotes
      const indexNote = listNote.findIndex((el,id)=>{return el.id == idNew})
      listNote[indexNote] = data
    })
  },
});

export const NoteStore = (state: RootState) => state.Notes; // get state
export default Notes.reducer;

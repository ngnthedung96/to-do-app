import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { produce } from "immer";
import moment from "moment";
// Define a type for the slice state
interface initialState {
  isFilter:boolean,
  listNote: NoteType[],
  listFilteredNote:NoteType[]
}
interface NoteType {
  id: number;
  note: string;
  status: number;
  dueDate?: number;
  isShow: number;
  idAssignee: number;
}

export const initialState:initialState = {
  isFilter:false,
  listNote: [
   
  ],
  listFilteredNote:[],
};

const Notes = createSlice({
  name: "Notes",
  initialState,
  reducers: {
    addNote( state, action: PayloadAction<NoteType>): void {
      const newNote = action.payload
        state.listNote.push(newNote)
    },
    editNote(state, action: PayloadAction<{id: number, dueDate: Date | null, status: number, defaultNote:string, selectedUserId:number}> ): void {
      const {id,
        dueDate,
        status,
        defaultNote,
        selectedUserId} = action.payload
      const noteIndex = state.listNote.findIndex((el:NoteType)=>el.id == id)
      const nextState = produce(state.listNote, (draft) => {
        draft[noteIndex].note = defaultNote;
        draft[noteIndex].dueDate = dueDate ? moment(new Date(dueDate)).unix() : 0;
        draft[noteIndex].status = status;
        if (selectedUserId) {
          draft[noteIndex].idAssignee = selectedUserId;
        }
      });
      state.listNote = nextState
    },
    deleteNote( state, action: PayloadAction<number>) {
      const id = action.payload
      const indexNote = state.listNote.findIndex((el) => {
        return el.id == id;
      });
      const spliceArr = state.listNote.splice(indexNote, 1);
    },
    editIsShowNote(state,action:PayloadAction<{ id: number, value:number}>){
      const {id, value} = action.payload
      const formattedArr = JSON.parse(JSON.stringify(state.listNote))
      const noteIndex = formattedArr.findIndex((el:NoteType)=>el.id == id)
      if(noteIndex >=0){
        const nextState = produce(state.listNote, (draft) => {
          draft[noteIndex].isShow = value;
        });
        state.listNote = nextState
      }

    },
    addFilteredNote( state, action: PayloadAction<NoteType>): void {
      const newNote = action.payload
      state.listFilteredNote.push(newNote)
    },
    editFilteredNote(state, action: PayloadAction<{id: number, dueDate: Date | null, status: number, defaultNote:string, selectedUserId:number}> ): void {
      const {id,
        dueDate,
        status,
        defaultNote,
        selectedUserId} = action.payload
        console.log(id)
      const noteIndex = state.listFilteredNote.findIndex((el:NoteType)=>el.id == id)
      const nextState = produce(state.listFilteredNote, (draft) => {
        draft[noteIndex].note = defaultNote;
        draft[noteIndex].dueDate = dueDate ? moment(new Date(dueDate)).unix() : 0;
        draft[noteIndex].status = status;
        if (selectedUserId) {
          draft[noteIndex].idAssignee = selectedUserId;
        }
      });
      state.listFilteredNote = nextState
    },
    deleteFilteredNote( state, action: PayloadAction<number>) {
      const id = action.payload
      const indexNote = state.listFilteredNote.findIndex((el) => {
        return el.id == id;
      });
      const spliceArr = state.listFilteredNote.splice(indexNote, 1);
    },
    addFilteredNotes(state, action: PayloadAction<NoteType[]>): void {
      const newNote = action.payload
      state.listFilteredNote = newNote
    },
    editIsShowFilteredNote(state,action:PayloadAction<{ id: number, value:number}>){
      const {id, value} = action.payload
      const formattedArr = JSON.parse(JSON.stringify(state.listFilteredNote))
      const noteIndex = formattedArr.findIndex((el:NoteType)=>el.id == id)
      if(noteIndex >=0){
        const nextState = produce(state.listFilteredNote, (draft) => {
          draft[noteIndex].isShow = value;
        });
        state.listFilteredNote = nextState
      }

    },
    resetFilteredNote(state){
      state.listFilteredNote = state.listNote
    },
    toggleIsFiltered(state,action:PayloadAction<boolean>){
      state.isFilter = action.payload
    },
    
  },
  extraReducers: (builder) => {
  }
});

export const NoteStore = (state: RootState) => state.Notes; // get state
export const {
  addNote,
  editNote, 
  deleteNote,
  editIsShowNote,
  addFilteredNote,
  editFilteredNote,
  deleteFilteredNote,
  addFilteredNotes,
  editIsShowFilteredNote,
  resetFilteredNote,
  toggleIsFiltered
   } = Notes.actions
export default Notes.reducer;

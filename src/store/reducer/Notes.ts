import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { DataNotes, NoteType } from "@/interfaces";

export interface NoteState {
  dataNotes: DataNotes;
}
// Define a type for the slice state
export const initialState: NoteState = {
  dataNotes: {
    totalNote: 0,
    listNote: [],
  },
};

const Notes = createSlice({
  name: "Notes",
  initialState,
  reducers: {
    fetchDataNote(state, action: PayloadAction<DataNotes>) {
      const data = action.payload;
      state.dataNotes = data;
    },
    addNote(state, action: PayloadAction<NoteType>) {
      const data = action.payload;
      state.dataNotes.listNote.unshift(data);
      state.dataNotes.listNote.splice(-1);
      state.dataNotes.totalNote++;
    },
    editNote(state, action: PayloadAction<NoteType>) {
      const newData = action.payload;
      const idNew = newData.id;
      const { listNote } = state.dataNotes;
      const indexNote = listNote.findIndex((el, index) => {
        return el.id == idNew;
      });
      listNote[indexNote] = newData;
    },
    deleteNote(state, action: PayloadAction<number>) {
      const id = action.payload;
      const { listNote } = state.dataNotes;
      const indexNote = listNote.findIndex((el, index) => {
        return el.id == id;
      });
      listNote.splice(indexNote, 1);
      state.dataNotes.totalNote--;
    },
  },
});

export const NoteStore = (state: RootState) => state.Notes; // get state
export const { fetchDataNote, addNote, editNote, deleteNote } = Notes.actions;
export default Notes.reducer;

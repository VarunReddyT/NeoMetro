import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
    booking: [{}],
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        addBooking: (state, action) => {
            state.booking[0] = {...state.booking[0], ...action.payload};
        },
        clearBooking: (state) => {
            state.booking = [{}];
        },
    },
})

const persistConfig = {
    key: "booking",
    storage,
};

const persistedAuthReducer = persistReducer(persistConfig, bookingSlice.reducer);

export const { addBooking, clearBooking } = bookingSlice.actions;
export default persistedAuthReducer;
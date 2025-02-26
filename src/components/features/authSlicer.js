import { createSlice } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = {
                token: action.payload.token,
                username: action.payload.username,
            };
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

const persistConfig = {
    key: "auth",
    storage,
};

const persistedAuthReducer = persistReducer(persistConfig, authSlice.reducer);

export const { login, logout } = authSlice.actions;
export default persistedAuthReducer;

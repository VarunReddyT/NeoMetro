import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlicer";
import { persistStore } from "redux-persist";
import bookingReducer from "../features/bookingSlicer";
export const store = configureStore({
    reducer:{
        auth : authReducer,
        booking : bookingReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        serializableCheck: false,
    }),
})

export const persistor = persistStore(store);
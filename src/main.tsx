import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { authReducer } from "./state/auth";
import { configureStore } from "@reduxjs/toolkit";
import { Provider, useSelector } from "react-redux";
import {
	persistStore,
	persistReducer,
	FLUSH,
	REHYDRATE,
	PAUSE,
	PERSIST,
	PURGE,
	REGISTER,
} from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { RootState } from "./state";

const storage = {
	getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
	setItem: (key: string, value: string) => Promise.resolve(window.localStorage.setItem(key, value)),
	removeItem: (key: string) => Promise.resolve(window.localStorage.removeItem(key)),
};

const persistConfig = { key: "studentx", storage, version: 1 };
const rootReducer = {
	auth: persistReducer(persistConfig, authReducer),
};
const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

const root = ReactDOM.createRoot(document.getElementById("root"));
const persistor = persistStore(store);
root.render(
	<Provider store={store}>
		<PersistGate loading={null} persistor={persistor}>
			<App />
		</PersistGate>
	</Provider>
);

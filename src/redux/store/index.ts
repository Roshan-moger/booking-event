import { legacy_createStore as createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import Reducer from "../reducer";
import { composeWithDevToolsDevelopmentOnly } from "@redux-devtools/extension";

const persistConfig = {
  key: "Booking-event",
  storage,
  blacklist: ["tokenInfo"],
};
const persistedReducer = persistReducer(persistConfig, Reducer);
const store = createStore(persistedReducer, composeWithDevToolsDevelopmentOnly());
const persistor = persistStore(store);

export { store, persistor };

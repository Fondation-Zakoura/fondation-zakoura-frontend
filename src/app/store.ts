import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../features/api/api';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import userReducer from '../features/user/userSlice';
import { partnersApi } from '../features/partnersApi';


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'] 
};

const rootReducer = combineReducers({
  user: userReducer,
    [partnersApi.reducerPath]: partnersApi.reducer,
  
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    })
      .concat(baseApi.middleware)
      .concat(partnersApi.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

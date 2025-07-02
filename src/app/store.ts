import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../features/api/api';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import userReducer from '../features/user/userSlice';
<<<<<<< HEAD
import { partnersApi } from '../features/partnersApi';
<<<<<<< HEAD
=======
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
=======
import { naturePartnersApi } from '@/features/api/naturePartnersApi';
import { structurePartnersApi } from '@/features/api/structurePartnersApi';
>>>>>>> 093bc3a (updating the filter to use RTK query)


const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'] 
};

const rootReducer = combineReducers({
  user: userReducer,
<<<<<<< HEAD
    [partnersApi.reducerPath]: partnersApi.reducer,
    [naturePartnersApi.reducerPath]: naturePartnersApi.reducer,
    [structurePartnersApi.reducerPath]: structurePartnersApi.reducer,
  
=======
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
<<<<<<< HEAD
    })
      .concat(baseApi.middleware)
<<<<<<< HEAD
      .concat(partnersApi.middleware),
=======
    }).concat(baseApi.middleware),
>>>>>>> a1b5ad8 (feat: Add Project Management and Liste)
=======
      .concat(partnersApi.middleware)
      .concat(naturePartnersApi.middleware)
      .concat(structurePartnersApi.middleware),
>>>>>>> 093bc3a (updating the filter to use RTK query)
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

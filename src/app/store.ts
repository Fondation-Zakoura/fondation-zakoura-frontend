import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../features/api/api';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import { combineReducers } from 'redux';
import userReducer from '../features/user/userSlice';
import { partnersApi } from '../features/partnersApi';
import { naturePartnersApi } from '@/features/api/naturePartnersApi';
import { structurePartnersApi } from '@/features/api/structurePartnersApi';
import { sitesApi } from '@/features/api/sitesApi';
import { geographicApi } from '@/features/api/geographicApi';
import { usersApi } from '@/features/api/usersApi';
import { unitApi } from '@/features/api/unitApi';
// import { cycleApi } from '@/features/api/cycleApi';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user'],
};

const rootReducer = combineReducers({
  user: userReducer,
  [partnersApi.reducerPath]: partnersApi.reducer,
  [naturePartnersApi.reducerPath]: naturePartnersApi.reducer,
  [structurePartnersApi.reducerPath]: structurePartnersApi.reducer,
  [baseApi.reducerPath]: baseApi.reducer,
  [sitesApi.reducerPath]: sitesApi.reducer,
  [geographicApi.reducerPath]: geographicApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer, 
  [unitApi.reducerPath]: unitApi.reducer,
  [cycleApi.reducerPath]: cycleApi.reducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist
    })
      .concat(baseApi.middleware)
      .concat(partnersApi.middleware)
      .concat(naturePartnersApi.middleware)
      .concat(structurePartnersApi.middleware)
      .concat(sitesApi.middleware)
      .concat(geographicApi.middleware)
      .concat(usersApi.middleware)
      .concat(unitApi.middleware)
      .concat(cycleApi.middleware),

});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

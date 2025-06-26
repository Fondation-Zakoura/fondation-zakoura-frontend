import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string;
  token: string | null;
  loggedIn: boolean;
}

const initialState: UserState = {
  
  token: null,
  loggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ name: string; token: string }>) {
      
      state.token = action.payload.token;
      state.loggedIn = true;
      localStorage.setItem('token', action.payload.token); 
    },
    logout(state) {
      state.name = '';
      state.token = null;
      state.loggedIn = false;
      localStorage.removeItem('token'); 
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;

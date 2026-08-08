import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  token: string;
  shippingAddress?: { address: string; city: string; state: string; postalCode: string; phone: string };
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

const userInfo = localStorage.getItem("userInfo");

const initialState: AuthState = {
  user: userInfo ? JSON.parse(userInfo) : null,
  isLoggedIn: !!userInfo,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isLoggedIn = true;
    },

    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;

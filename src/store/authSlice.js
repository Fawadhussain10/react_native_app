import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { status: false, userData: null, booting: true },
  reducers: {
    login: (s, a) => { s.status = true; s.userData = a.payload; s.booting = false; },
    logout: (s) => { s.status = false; s.userData = null; s.booting = false; },
    booted: (s, a) => { s.status = !!a.payload; s.userData = a.payload || null; s.booting = false; },
  },
});

export const { login, logout, booted } = authSlice.actions;
export default authSlice.reducer;

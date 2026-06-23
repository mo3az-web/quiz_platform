import api from "./api";
import type { RegisterForm } from "../types/types";




export const registerUser = (data: RegisterForm) => {
  return api.post("/register", data);
};
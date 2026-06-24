import api from "./api";
import type { RegisterForm } from "../types/types";
import type { LoginForm } from "../types/types";



export const registerUser = (data: RegisterForm) => {
  return api.post("/register", data);
};


export const loginUser = (data: LoginForm) => {
  return api.post("/login", data);
}
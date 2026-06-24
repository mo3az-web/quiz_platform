import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { loginUser } from "../Api/auth";
import type { LoginForm } from "../types/types";




export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

 
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value,
  });
};


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await loginUser(form);
    const data = res.data;
    const user = data.user ?? data.data?.user;
    const token = data.token ?? data.access_token ?? data.data?.token;
    const role = data.role ?? user?.role ?? "user";

    console.log("User Logged In:", data);

    if (token) {
      localStorage.setItem("token", token);
    }

    localStorage.setItem("role", role);

    if (user?.name) {
      localStorage.setItem("username", user.name);
    }

    navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });

  } catch (err: any) {
    if (err.response?.data?.errors) { 
      
      const errors = err.response.data.errors;
      setError(Object.values(errors).flat().join(", "));
    } else {
      setError("Something went wrong");
    }
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <NavLink  to={'/register'} className="text-blue-600 cursor-pointer">
            Sign up
          </NavLink>
        </p>
      </div>
    </div>
  );
}
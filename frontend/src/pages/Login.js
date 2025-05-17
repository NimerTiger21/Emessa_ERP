// src/pages/Login.js
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStateContext } from "../contexts/ContextProvider";
import { Button } from "../components";
//import loginImage from '../assets/login-bg.jpg'; // Optional background image
import loginImage from '../data/login-bg.jpg';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { currentColor, currentMode } = useStateContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password); // let login handle navigation
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center ${
        currentMode === "Dark" ? "bg-gray-900" : "bg-gray-100"
      }`}
      style={{
        backgroundImage: `url(${loginImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="bg-white dark:bg-[#2c2c2c] shadow-2xl rounded-lg p-10 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#3b3b3b] dark:border-gray-600 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-[#3b3b3b] dark:border-gray-600 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            text="Login"
            type="submit"
            bgColor={currentColor}
            color="white"
            borderRadius="10px"
            width="full"
            size="lg"
          />
        </form>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          <p>
            Don't have an account?{" "}
            <a href="/" className="text-primary font-semibold hover:underline">
              Register
            </a>
          </p>
          <p className="mt-2">
            <a href="/reset-password" className="text-primary hover:underline">
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

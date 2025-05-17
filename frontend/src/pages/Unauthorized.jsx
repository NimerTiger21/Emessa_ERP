// src/pages/Unauthorized.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-center p-6">
      <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-8">
        You do not have permission to view this page.
      </p>
      <Button
        text="Go Back Home"
        bgColor="#03C9D7"
        color="white"
        borderRadius="8px"
        onClick={() => navigate("/")}
      />
    </div>
  );
};

export default Unauthorized;

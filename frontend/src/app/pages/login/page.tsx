"use client"
import React, { useState, useEffect } from "react";
import "./login.css";
import Link from 'next/link';
import { FaPowerOff } from "react-icons/fa";

const page: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState<string>("rgba(255, 255, 255, 0.8)");

  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the login logic here
    console.log("Logging in with", formData);
  };


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });

      // Change color dynamically based on mouse position
      const red = (event.clientX / window.innerWidth) * 255;
      const green = (event.clientY / window.innerHeight) * 255;
      const blue = 255 - (red + green) / 2; // Create a dynamic effect based on mouse position

      setColor(`rgb(${red}, ${green}, ${blue})`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div id="app" className="relative w-full h-screen">
      {/* Color Follower with Dynamic Color */}
      <div
        className="color-follower"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: color, // Dynamic color based on mouse position
        }}
      ></div>

      {/* Main Content */}
      <div
        className="absolute text-black text-center"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <h1 className="font-space-mono text-sm uppercase tracking-wide">
          Login to Your Account
        </h1>
        <p className="font-exo text-2xl mt-4">
          Please enter your credentials to continue
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Log In
          </button>
        </form>
        
        <Link href="/pages/register" className="mt-8 text-sm p-3">Don't have an account?</Link>
       
      </div>

      
    </div>
  );
};

export default page;

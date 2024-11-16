"use client"
import React, { useState, useEffect } from "react";
import "./login.css";
import Link from 'next/link';


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
        <div className="card bg-transparent shadow-lg rounded-lg p-6 sm:p-8 w-11/12 sm:w-96 border border-gray-300 cursor-pointer">
          <h1 className="font-sans-serif text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl uppercase tracking-wide font-bold">
            Login to Your Account
          </h1>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="text-sm sm:text-md font-sans-serif text-left block"
              >
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
              <label
                htmlFor="password"
                className="text-sm sm:text-md block font-sans-serif text-left"
              >
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
              className="w-full px-4 py-2 mt-4 bg-gradient-to-r from-purple-500 to-violet-300 text-white rounded-lg hover:from-purple-600 hover:to-violet-400"
            >
              Log In
            </button>
          </form>

          <Link href="/pages/register" className="mt-6 sm:mt-10 text-xs sm:text-sm p-3">
            Don't have an account?
          </Link>
        </div>
      </div>
    </div>

  );
};

export default page;

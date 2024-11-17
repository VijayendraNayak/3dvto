"use client";
import React, { useState } from "react";
import "./login.css";
import Link from "next/link";

const page: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle the login logic here
    console.log("Logging in with", formData);
  };

  return (
    <div className="flex items-center justify-center h-screen w-full relative">
      {/* Card Container - Adjusting width and z-index */}
      <div className="flex flex-col sm:flex-row w-full sm:w-4/5 lg:w-2/3 xl:w-1/2 bg-gradient-to-r from-indigo-700 to-purple-900 rounded-lg relative z-10">
        
        {/* Left Section (Image) */}
        <div className="flex justify-center items-center w-full rounded-l-lg p-6  md:block lg:block xl:block">
          <img
            src="/login.png" 
            alt="Virtual Try On"
            className="h-100 hidden md:block lg:block xl:block"
          />
        </div>

        {/* Right Section (Form) */}
        <div className="flex flex-col justify-center items-center xl:w-full lg:w-1/2 sm:w-1/2 bg-transparent rounded-r-lg p-5">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
            Log in to Virtual Try On
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">

            <div>
              <label
                htmlFor="email"
                className="text-sm sm:text-md font-sans-serif text-left block text-white font-bold"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm sm:text-md block font-sans-serif text-left text-white font-bold"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 mt-4 bg-gradient-to-r from-purple-500 to-violet-300 text-white rounded-lg hover:from-purple-600 hover:to-violet-400"
            >
             Login
            </button>
          </form>

          <div className="mt-2 text-center">
            <Link href="/pages/register" className="text-sm text-white hover:underline">
              Create new account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

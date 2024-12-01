"use client";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { useState } from "react";
import Loader from "@/components/Loader";

const page: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const handleLogout = () => {
    // Clear all cookies
    setLoading(true)
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    localStorage.clear();

    sessionStorage.clear();

    window.location.href = '/';
    setLoading(false)

  };
  const user = useSelector((state: RootState) => state.auth.user);
  console.log(user)

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center px-4 mt-10">
      {loading&&<Loader/>}
      {/* Profile Section */}
      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md text-center relative shadow-black">
        {/* Avatar */}
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <img
            src="/profile.png"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
        </div>

        <div className="mt-20 space-y-4">
          {/* Username */}
          <h2 className="text-xl font-bold text-gray-800">{user.name || "Loading..."}</h2>

          {/* User Details */}
          <div className="text-left mt-6 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Email:</span>
              <span>{user.email || "Loading..."}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span className="font-medium">Phone:</span>
              <span>{user.phone || "Loading..."}</span>
            </div>
            {
              user.role === "admin" ? (
                <div></div>
              ) : (
                <div className="flex justify-between text-gray-600">
                  <span className="font-medium">Address:</span>
                  <span className="text-right">{user.address || "Loading..."}</span>
                </div>
              )
            }

          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-8 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default page;

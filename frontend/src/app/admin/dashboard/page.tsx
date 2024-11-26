"use client";
import React from "react";
import Sidebar from "@/components/Admin_sidebar";
const page = () => {
  return (
    <div className="relative flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <main className="relative flex-1 p-6 z-0 mt-20">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold">Total Stock</h2>
            <p className="text-2xl font-bold text-blue-600">1500</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold">Total Orders</h2>
            <p className="text-2xl font-bold text-blue-600">500</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold">Total sales</h2>
            <p className="text-2xl font-bold text-blue-600">300</p>
          </div>
        </div>

        f
        
      </main>
    </div>
  );
};

export default page;

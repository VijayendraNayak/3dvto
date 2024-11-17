"use client";
import React from "react";
import Link from "next/link";

const page = () => {
  return (
    <div className="relative flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <aside className="relative w-64 bg-blue-800 text-white z-10">
        <div className="p-6 text-center">
          <h1 className="text-lg font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <ul className="space-y-4">
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/pages/admin/dashboard">Dashboard</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/pages/admin/add">Add Stock</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <a href="/pages/admin/remove">Remove Stock</a>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <a href="/pages/admin/updateitem">Update Stock</a>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <a href="/pages/admin/manage">Manage Stock</a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="relative flex-1 p-6 z-0">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white shadow-md rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold">Total Stock</h2>
            <p className="text-2xl font-bold text-blue-600">1500</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold">Number of Shirts</h2>
            <p className="text-2xl font-bold text-blue-600">500</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4 text-center">
            <h2 className="text-lg font-semibold">Sold</h2>
            <p className="text-2xl font-bold text-blue-600">300</p>
          </div>
        </div>

        {/* Optional Table or Additional Features */}
        <div className="mt-8 bg-white shadow-md rounded-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Stock Updates</h2>
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="border-b py-2">Cloth ID</th>
                <th className="border-b py-2">Cloth Type</th>
                <th className="border-b py-2">Size</th>
                <th className="border-b py-2">Stock</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2">001</td>
                <td className="py-2">Shirt</td>
                <td className="py-2">M</td>
                <td className="py-2">50</td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default page;

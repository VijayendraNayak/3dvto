"use client";
import React from "react";
import Link from "next/link";

const page = () => {
    return (
      <div className="relative flex min-h-screen bg-transparent">
        {/* Sidebar */}
        <aside className="relative w-64 bg-blue-800 text-white z-10">
          <div className="p-6 text-center bg-blue-900 ">
            <h1 className="text-xl font-bold mt-20 ">Admin Panel</h1>
          </div>
          <nav className="mt-2">
            <ul className="space-y-4">
              <Link href="/admin/dashboard" className="px-4 flex justify-center py-2 hover:bg-blue-700">
                <div>Dashboard</div>
              </Link>
              <Link href="/admin/add"className="px-4 py-2 flex justify-center hover:bg-blue-700">
                <div>Add Stock</div>
              </Link>
              <Link href="/admin/updateitem" className="px-4 py-2 flex justify-center hover:bg-blue-700">
                <div>Update & Delete Stock</div>
              </Link>
              <Link href="/admin/order" className="px-4 py-2 flex justify-center hover:bg-blue-700">
                <div>Orders</div>
              </Link>
            </ul>
          </nav>
        </aside>
    </div>
  );
};

export default page;

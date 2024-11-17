import React from 'react'
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
              <Link href="/pages/admin/delete">Delete Stock</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/pages/admin/updateitem">Update Stock</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/pages/admin/manage">Manage Stock</Link>
            </li>
          </ul>
        </nav>
      </aside>
      </div>
  );
};

export default page
"use client";

import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router=useRouter()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, you don't have permission to access this page.
        </p>
        <button 
        className="px-4 rounded-full py-2 bg-purple-500 hover:bg-purple-600 " onClick={()=>router.push("/")}>
          return home
        </button>
      </div>
    </div>
  );
}
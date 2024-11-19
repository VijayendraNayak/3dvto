"use client";

import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div 
        className="text-center p-8 bg-white rounded-lg shadow-md relative z-10">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Access Forbidden
        </h2>
        <p className="text-gray-600 mb-8">
          Sorry, you don't have permission to access this page.
        </p>
        <button 
          className="px-4 py-2 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
          onClick={() => router.push("/")}>
          Return Home
        </button>
      </div>
      <div className="absolute inset-0 bg-gray-900 opacity-50 z-0"></div>
    </div>
  );
}

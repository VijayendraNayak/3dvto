"use client";
import React, { useState } from "react";
import axios from "axios";
import Admin_sidebar from "../../../components/Admin_sidebar";
import Card from "@/components/Card";

interface SearchParams {
  name?: string;
  category?: string;
  id?: string;
  color?: string;
  size?: string;
}

interface ClothItem {
  _id: string;
  name: string;
  category: string;
  price: string;
  color: string;
  sizes: string;
  stock: string;
  thumbnail_path: string;
}

const SearchCloth: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: "",
    category: "",
    id: "",
    color: "",
    size: "",
  });
  const [results, setResults] = useState<ClothItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    try {
      const response = await axios.get(`/api/admin/search-cloth?${params.toString()}`);
      setResults(response.data);
      console.log(response)
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred during the search"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex">
      <Admin_sidebar />
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 bg-gray-100">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Search Clothing Items
        </h2>
        <form
          onSubmit={handleSearch}
          className="bg-white shadow-md rounded-lg p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={searchParams.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter clothing name"
              />
            </div>
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={searchParams.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter category"
              />
            </div>
            <div>
              <label
                htmlFor="id"
                className="block text-sm font-medium text-gray-700"
              >
                ID
              </label>
              <input
                type="text"
                id="id"
                name="id"
                value={searchParams.id}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter item ID"
              />
            </div>
            <div>
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700"
              >
                Color
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={searchParams.color}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter color"
              />
            </div>
            <div>
              <label
                htmlFor="size"
                className="block text-sm font-medium text-gray-700"
              >
                Size
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={searchParams.size}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter size"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && <p className="text-red-600 mt-4 text-center">{error}</p>}

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Results:</h3>
          {results.length === 0 && !loading && (
            <p className="text-center text-gray-600">No items found.</p>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <Card key={item._id} item={item} />
              ))}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default SearchCloth;

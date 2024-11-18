"use client";
import React, { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the shape of the cloth details object
interface ClothDetails {
  clothId: string;
  clothType: string;
  size: string;
  color: string;
  stock: number;
  price: number;
}

// Mock function to simulate fetching cloth details from an API
const fetchClothDetails = async (clothId: string): Promise<ClothDetails> => {
  const mockClothData: ClothDetails = {
    clothId: "12345",
    clothType: "T-Shirt",
    size: "M",
    color: "Red",
    stock: 50,
    price: 25.99,
  };
  return new Promise((resolve) => setTimeout(() => resolve(mockClothData), 1000));
};

// Mock function to simulate updating cloth details in a database
const updateCloth = async (clothDetails: ClothDetails) => {
  console.log(`Cloth with ID ${clothDetails.clothId} updated:`, clothDetails);
};

const UpdateStock = () => {
  const [clothId, setClothId] = useState<string>(""); // To capture input cloth ID
  const [clothDetails, setClothDetails] = useState<ClothDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle cloth ID input change
  const handleClothIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClothId(e.target.value);
  };

  // Handle the search functionality
  const handleSearch = async () => {
    if (clothId) {
      setLoading(true);
      const details = await fetchClothDetails(clothId);
      setClothDetails(details);
      setLoading(false);
    } else {
      alert("Please enter a Cloth ID to search.");
    }
  };

  // Handle the update functionality
  const handleUpdate = async () => {
    if (clothDetails) {
      await updateCloth(clothDetails);
      toast.success("Cloth details updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  // Handle input change for cloth details (except clothId)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (clothDetails) {
      setClothDetails({
        ...clothDetails,
        [e.target.name]: e.target.value,
      });
    }
  };

  return (
    <div className="relative flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <aside className="relative w-64 bg-blue-800 text-white z-10">
        <div className="p-6 text-center">
          <h1 className="text-lg font-bold mt-20">Admin Panel</h1>
        </div>
        <nav className="mt-2">
          <ul className="space-y-4">
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/admin/add">Add Stock</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/admin/delete">Delete Stock</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/admin/updateitem">Update Stock</Link>
            </li>
            <li className="px-4 py-2 hover:bg-blue-700">
              <Link href="/admin/manage">Manage Stock</Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 mt-20">
        <h1 className="text-2xl font-bold mb-6">Update Stock</h1>

        {/* Input for Cloth ID */}
        <div className="mb-6">
          <label htmlFor="clothId" className="block font-semibold text-gray-700 mb-2">Enter Cloth ID</label>
          <div className="flex">
            <input
              type="text"
              id="clothId"
              value={clothId}
              onChange={handleClothIdChange}
              className="w-full p-3 border rounded-lg shadow-sm"
              placeholder="Enter Cloth ID to search"
            />
            <button
              onClick={handleSearch}
              className="ml-4 bg-blue-800 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>

        {/* Display cloth details for update */}
        {loading && <p>Loading cloth details...</p>}

        {clothDetails && !loading && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Edit Cloth Details</h2>

            {/* Cloth Type */}
            <div className="mb-4">
              <label htmlFor="clothType" className="block font-semibold text-gray-700 mb-2">Cloth Type</label>
              <input
                type="text"
                id="clothType"
                name="clothType"
                value={clothDetails.clothType}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Size */}
            <div className="mb-4">
              <label htmlFor="size" className="block font-semibold text-gray-700 mb-2">Size</label>
              <input
                type="text"
                id="size"
                name="size"
                value={clothDetails.size}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Color */}
            <div className="mb-4">
              <label htmlFor="color" className="block font-semibold text-gray-700 mb-2">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={clothDetails.color}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Stock */}
            <div className="mb-4">
              <label htmlFor="stock" className="block font-semibold text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={clothDetails.stock}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Price */}
            <div className="mb-4">
              <label htmlFor="price" className="block font-semibold text-gray-700 mb-2">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={clothDetails.price}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
              />
            </div>

            {/* Update Button */}
            <div className="mt-4">
              <button
                onClick={handleUpdate}
                className="bg-blue-800 text-white p-3 rounded-lg hover:bg-blue-700 w-full"
              >
                Update Cloth
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Toast container */}
      <ToastContainer />
    </div>
  );
};

export default UpdateStock;

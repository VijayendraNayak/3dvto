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

// Mock function to simulate deleting cloth from a database
const deleteCloth = async (clothId: string) => {
  console.log(`Cloth with ID ${clothId} has been deleted.`);
};

const DeleteStock = () => {
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

  // Handle cloth deletion
  const handleDelete = async () => {
    if (clothDetails) {
      await deleteCloth(clothId);
      toast.success("Cloth deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setClothDetails(null); // Clear the details after deletion
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
        <h1 className="text-2xl font-bold mb-6">Delete Stock</h1>

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

        {/* Display cloth details */}
        {loading && <p>Loading cloth details...</p>}

        {clothDetails && !loading && (
          <div className="bg-gray-100 opacity-2 p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Cloth Details</h2>
            <p><strong>Cloth Type:</strong> {clothDetails.clothType}</p>
            <p><strong>Size:</strong> {clothDetails.size}</p>
            <p><strong>Color:</strong> {clothDetails.color}</p>
            <p><strong>Stock:</strong> {clothDetails.stock}</p>
            <p><strong>Price:</strong> ${clothDetails.price.toFixed(2)}</p>

            <div className="mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-500 w-full"
              >
                Delete Cloth
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

export default DeleteStock;

"use client";
import React, { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddStock = () => {
  const [formData, setFormData] = useState({
    clothId: "",
    clothType: "",
    size: "",
    color: "",
    stock: "",
    price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Stock Added:", formData);

    // Logic to save stock to the database or state goes here.

    // Show success toast
    toast.success("Stock added successfully!");

    // Reset the form after submission
    setFormData({
      clothId: "",
      clothType: "",
      size: "",
      color: "",
      stock: "",
      price: "",
    });
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
        <h1 className="text-2xl font-bold mb-6">Add Stock</h1>
        <form className="bg-gray-100 opacity-2 shadow-md rounded-md p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="clothId" className="block font-semibold">
                Cloth ID
              </label>
              <input
                type="text"
                id="clothId"
                name="clothId"
                value={formData.clothId}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Cloth ID"
                required
              />
            </div>

            <div>
              <label htmlFor="clothType" className="block font-semibold">
                Cloth Type
              </label>
              <input
                type="text"
                id="clothType"
                name="clothType"
                value={formData.clothType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Cloth Type"
                required
              />
            </div>

            <div>
              <label htmlFor="size" className="block font-semibold">
                Size
              </label>
              <select
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="" disabled>
                  Select Size
                </option>
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
                <option value="XL">Extra Large</option>
              </select>
            </div>

            <div>
              <label htmlFor="color" className="block font-semibold">
                Color
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Color"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="block font-semibold">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Stock Quantity"
                required
              />
            </div>

            <div>
              <label htmlFor="price" className="block font-semibold">
                Price
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Price"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
            >
              Add Stock
            </button>
          </div>
        </form>

        {/* Toast Container for Notifications */}
        <ToastContainer />
      </main>
    </div>
  );
};

export default AddStock;

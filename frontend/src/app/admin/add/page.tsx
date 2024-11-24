"use client";
import React, { useState } from "react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/components/Admin_sidebar";
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
      <Sidebar/>

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

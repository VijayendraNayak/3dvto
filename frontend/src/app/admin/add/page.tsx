"use client";
import React, { useState } from "react";
import { Toaster, toast } from "sonner";
import axios from "axios";
import Sidebar from "@/components/Admin_sidebar";

const AddStock = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sizes: "", // Changed to a plain string
    color: "",
    stock: "",
    price: "",
    image: null, // Changed to null for file
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("sizes",formData.sizes); // Convert sizes to array
    data.append("color", formData.color);
    data.append("stock", formData.stock);
    data.append("price", formData.price);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.post("/api/admin/add-cloth", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Stock added successfully!", {
          position: "top-right",
          duration: 2000,
        });

        // Reset the form
        setFormData({
          name: "",
          category: "",
          sizes: "",
          color: "",
          stock: "",
          price: "",
          image: null,
        });
      } else {
        toast.error(response.data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Error submitting form");
    }
  };

  return (
    <div className="relative flex min-h-screen bg-transparent">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 mt-20">
        <h1 className="text-2xl font-bold mb-6">Add Stock</h1>
        <form
          className="bg-gray-100 shadow-md rounded-md p-6"
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block font-semibold">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Name"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block font-semibold">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Category"
                required
              />
            </div>

            <div>
              <label htmlFor="sizes" className="block font-semibold">
                Sizes
              </label>
              <input
                type="text"
                id="sizes"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Sizes (e.g., S, M, L, XL)"
                required
              />
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
                type="text"
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
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Enter Price"
                required
              />
            </div>

            <div>
              <label htmlFor="image" className="block font-semibold">
                Upload Image
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
        </form>

        {/* Toast Container for Notifications */}
        <Toaster richColors />
      </main>
    </div>
  );
};

export default AddStock;

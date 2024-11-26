"use client"
import axios from "axios";
import { useState } from "react";
import { toast, Toaster } from "sonner";

interface Clothitem {
    name: string; // Changed to lowercase string
    category: string; // Corrected the property name
    price: string; // Assuming price is passed as a string, change to number if needed
    color: string;
    sizes: string; // Changed to an array of strings
    stock: string;
    thumbnail_path: string; // Added this property for the image URL
    _id: string;
}

const UpdatePop: React.FC<{ item: Clothitem, isvisible: boolean, onclose: () => void }> = ({ item, onclose, isvisible }) => {
    const [formData, setFormData] = useState<Clothitem>({ ...item });
    console.log(formData)
    const onupdate = async (id: string) => {
        try {
            const response = await axios.patch(`/api/admin/update-cloth/${id}`, formData,{

                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (response.status === 200) {
                toast.success("Item updated successfully!", {
                    position: "top-right",
                    duration: 2000
                });

                // Close the popup
                onclose();

                // Optional: Reload the page or update the list
                setTimeout(() => {
                    location.reload();
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating the item", {
                position: "top-right",
                duration: 2000
            });
        }
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }
    if (!isvisible) return null;
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className=" max-w-7xl mx-auto bg-white rounded-xl p-6">
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
                            value={formData.name}
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
                            value={formData.category}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter category"
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
                            value={formData.color}
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
                            value={formData.sizes}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter size"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="stock"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Stock
                        </label>
                        <input
                            type="text"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter stock"
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Price
                        </label>
                        <input
                            type="text"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter stock"
                        />
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button className="bg-green-500 px-6 py-2 rounded-lg text-white font-semibold hover:bg-green-600"
                        onClick={()=>onupdate(item._id)}>
                        Update
                    </button>
                    <button
                        className="bg-red-500 px-6 py-2 rounded-lg text-white font-semibold hover:bg-red-600"
                        onClick={onclose}>
                        Close
                    </button>
                </div>
            </div>
            <Toaster richColors/>
        </div>
    )
}

export default UpdatePop;
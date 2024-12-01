"use client"
import axios from 'axios';
import React from 'react';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';

interface CartItem {
    _id: string;
    user_id: string;
    cloth: ClothDetails;
    quantity: number;
    created_at: string;
}

export interface ClothDetails {
    [key: string]: any;
}


const Cartcard: React.FC<{ item: CartItem }> = ({ item }) => {

    const handleDeleteClick = async (id: string) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`/api/cart/delete/${id}`)
                if (response.status === 200) {
                    console.log("Item from the cart deleted successfully")
                    toast.success("Item from the cart deleted successfully!", {
                        position: "top-right",
                        duration: 2000
                    });
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }
            } catch (err) {
                console.log(err)
                toast.error("Error deleting the Cart Item", {
                    position: "top-right",
                    duration: 2000
                })
            }
        }
    }


    {console.log(item.cloth.thumbnail_path)}
    return (
        <div className="bg-white w-72 shadow-md flex flex-col justify-center rounded-lg gap-4 p-4 mb-4">
            <h4 className="text-xl font-semibold text-center">{item.cloth.name}</h4>
            <div>
                <p>Category: ${item.cloth.category}</p>
                <p>Adress: {item.cloth.price}</p>
                <p>Quantity:{item.quantity}</p>
            </div>
            <img
                src={item.cloth.thumbnail_path}
                alt={item.cloth.name}
                className="w-32 h-32 object-cover mt-2 mx-auto rounded-md"
            />
            <div className='flex gap-6 justify-center'>
                <button
                    onClick={() => handleDeleteClick(item._id)}
                    className='flex px-4 py-2 text-white bg-red-500 hover:bg-red-600 font-semibold rounded-lg'>
                    Delete
                </button>
            </div>
            <Toaster richColors />
        </div>
    );
};

export default Cartcard;
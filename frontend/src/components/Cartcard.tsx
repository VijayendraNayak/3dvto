"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import Loader from './Loader';
import { useSelector } from 'react-redux';
import { RootState } from "../../store"


interface CartItem {
    _id: string;
    user_id: string;
    cloth: ClothDetails;
    quantity: number;
    created_at: string;
}
interface UserCartDetails {
    user_id: string; // Unique ID of the user
    username: string; // Full name of the user
    email: string; // Email address of the user
    address: string; // User's address
    phone: string; // Contact number of the user
    cloth_id: string; // Unique ID of the cloth item
    clothname: string; // Name of the cloth item
  }
  
export interface ClothDetails {
    [key: string]: any;
}


const Cartcard: React.FC<{ item: CartItem }> = ({ item }) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState<UserCartDetails | null>(null);
    const user = useSelector((state: RootState) => state.auth.user) || null;
    useEffect(() => {
        if (user && item) { // Ensure user and item are not null or undefined
            setFormData({
                user_id: user.id,
                username: user.name,
                email: user.email,
                address: user.address,
                phone: user.phone,
                cloth_id: item._id,
                clothname: item.cloth.name,
            });
        }
    }, [user, item]); // Add user and item as dependencies
    

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
                setLoading(true)
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
            } finally {
                setLoading(false)
            }
        }
    }
    const handleOrderClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/order/add", formData);
            if (response.status === 201) {
                console.log("here")
                toast.success("Order placed successfully!", { position: "top-right", duration: 2000 });
                
                // Automatically delete item from UI
                try {
                    const deleteResponse = await axios.delete(`/api/cart/delete/${item._id}`);
                    if (deleteResponse.status === 200) {
                        toast.success("Item removed from cart after ordering.", { position: "top-right", duration: 2000 });

                        // Remove the item from UI
                        setTimeout(() => {
                            location.reload();
                        }, 2000);
                    }
                } catch (deleteError) {
                    toast.error("Error removing item from cart.", { position: "top-right", duration: 2000 });
                }
            }
        } catch (orderError) {
            toast.error("Error placing order. Please try again.", { position: "top-right", duration: 2000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white w-72 shadow-md flex flex-col justify-center rounded-lg gap-4 p-4 mb-4">
            {loading && <Loader />}
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
                <button
                    onClick={() => handleOrderClick()}
                    className='flex px-4 py-2 text-white bg-green-500 hover:bg-green-600 font-semibold rounded-lg'>
                    Order
                </button>
            </div>
            <Toaster richColors />
        </div>
    );
};

export default Cartcard;
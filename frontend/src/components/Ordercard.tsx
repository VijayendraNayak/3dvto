"use client"
import axios from 'axios';
import React from 'react';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';

interface OrderItem {
    _id: string; 
    user_id: string; 
    username: string; 
    email: string; 
    address: string; 
    phone: string; 
    cloth_id: string; 
    clothname: string; 
    created_at: string; 
  }

const Ordercard: React.FC<{ item: OrderItem }> = ({ item }) => {

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
        const response = await axios.delete(`/api/order/delete/${id}`)
        if (response.status === 200) {
          console.log("Order deleted successfully")
          toast.success("Order deleted successfully!", {
            position: "top-right",
            duration: 2000
          });
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      } catch (err) {
        console.log(err)
        toast.error("Error deleting the Order", {
          position: "top-right",
          duration: 2000
        })
      }
    }
  }

  return (
    <div className="bg-white w-80 border shadow-md flex flex-col justify-center rounded-lg gap-4 p-4 mb-4">
      <h4 className="text-xl font-semibold text-center">{item.username}</h4>
      <div>
        <p>OrderId:{item._id}</p>
        <p>UserId: {item.user_id}</p>
        <p>ClothId: {item.cloth_id}</p>
        <p>Email: ${item.email}</p>
        <p>Adress: {item.address}</p>
        <p>Phone: {item.phone}</p>
        <p>ClothName:{item.clothname}</p>
      </div>
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

export default Ordercard;
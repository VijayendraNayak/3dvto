"use client"
import axios from 'axios';
import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import Swal from 'sweetalert2';
import UpdatePop from './UpdatePop';

interface ClothItem {
  name: string;
  category: string;
  price: string;
  color: string;
  sizes: string;
  stock: string;
  thumbnail_path: string;
  _id: string;
}

const Card: React.FC<{ item: ClothItem }> = ({ item }) => {
  const [isvisible, setIsvisible] = useState<boolean>(false);
  const path = window.location.pathname.includes("/updateitem");

  const onopen = () => {
    setIsvisible(true);
  }

  const onclose = () => {
    setIsvisible(false);
  }

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
        const response = await axios.delete(`/api/admin/delete-cloth/${id}`)
        if (response.status === 200) {
          console.log("item deleted successfully")
          toast.success("Item deleted successfully!", {
            position: "top-right",
            duration: 2000
          });
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      } catch (err) {
        console.log(err)
        toast.error("Error deleting the item", {
          position: "top-right",
          duration: 2000
        })
      }
    }
  }


  return (
    <div className="bg-white w-72 shadow-md flex flex-col justify-center rounded-lg gap-4 p-4 mb-4">
      <h4 className="text-xl font-semibold text-center">{item.name}</h4>
      <div>
        <p>Id:{item._id}</p>
        <p>Category: {item.category}</p>
        <p>Price: ${item.price}</p>
        <p>Color: {item.color}</p>
        <p>Sizes: {item.sizes}</p>
        <p>Stock: {item.stock}</p>
      </div>
      <img
        src={item.thumbnail_path}
        alt={item.name}
        className="w-32 h-32 object-cover mt-2 mx-auto rounded-md"
      />
      {
        path &&
        <div className='flex gap-6 justify-center'>
          <button
            onClick={onopen}
            className='flex px-4 py-2 text-white bg-green-500 hover:bg-green-600 font-semibold rounded-lg'>
            Update
          </button>
          <button
            onClick={() => handleDeleteClick(item._id)}
            className='flex px-4 py-2 text-white bg-red-500 hover:bg-red-600 font-semibold rounded-lg'>
            Delete
          </button>
        </div>
      }
      <Toaster richColors />
      {isvisible && <UpdatePop item={item} isvisible={isvisible} onclose={onclose} />}
    </div>
  );
};

export default Card;
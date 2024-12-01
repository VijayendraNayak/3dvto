"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Admin_sidebar";
import axios from "axios";
import Card from "@/components/Card";

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


const page = () => {

  const [clothdata,setClothdata]=useState<ClothItem[]>([]);
  const [orderdata, setOrderdata]=useState<OrderItem[]>([])

  useEffect(()=>{
    const fetchclothData=async()=>{
      try{
        const response=await axios.get("/api/getall")
        setClothdata(response.data)
      }catch(err){
        console.log(err)
      }
    }
    const fetchorderData=async()=>{
      try{
        const response=await axios.get('/api/admin/order/getall')
        setOrderdata(response.data)
      }catch(err){
        console.log(err)
      }
    }
    
    fetchclothData()
    fetchorderData()
  },[])
  return (


    <div className="relative flex min-h-screen bg-transparent max-w-screen ">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <main className="relative flex-1 p-6 z-0 mt-20">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-md p-4 border text-center">
            <h2 className="text-lg font-semibold">Total Stock</h2>
            <p className="text-2xl font-bold text-blue-600">{clothdata.length}</p>
          </div>
          <div className="bg-white shadow-md rounded-md p-4 border text-center">
            <h2 className="text-lg font-semibold">Total Orders</h2>
            <p className="text-2xl font-bold text-blue-600">{orderdata.length}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-center font-semibold text-2xl ">
            Clothes in DataBase
          </p>
          <div>
            {clothdata.length===0&&(<p className="text-red-500 text-center font-semibold text-xl mt-4">No clothes to display</p>)}
            {clothdata.length>0&&(
              <div className="flex flex-wrap gap-4">
                {clothdata.map((item)=>(
                  <Card key={item._id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;

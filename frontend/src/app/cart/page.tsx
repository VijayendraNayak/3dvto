"use client"
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../../store/";
import Cartcard from '@/components/Cartcard';

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


const page = () => {
    const [orderdata, setOrderdata] = useState<CartItem[]>([])
    const user = useSelector((state: RootState) => state.auth.user) || null;
    useEffect(() => {
        const fetchorderData = async () => {
            try {
                const response = await axios.get(`/api/cart/getall/${user.id}`)
                setOrderdata(response.data.cartitems)
            } catch (err) {
                console.log(err)
            }
        }
        fetchorderData()
    }, [])
    return (
        <div className='mt-24 relative mx-8'>
            <div className='text-center mb-8 text-3xl font-semibold'>
                Total Number of orders:{orderdata.length}
            </div>
            <div>
                {orderdata.length === 0 && (<p className="text-red-500 text-center font-semibold text-xl mt-4">No Items in the cart to display</p>)}
                {orderdata.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {orderdata.map((item) => (
                            <Cartcard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default page
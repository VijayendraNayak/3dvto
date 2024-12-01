"use client"
import Ordercard from '@/components/Ordercard';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../../store/";
import Loader from '@/components/Loader';

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
    const [orderdata, setOrderdata] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState<boolean>(false);
    const user = useSelector((state: RootState) => state.auth.user) || null;
    useEffect(() => {
        const fetchorderData = async () => {
            setLoading(true)
            try {
                const response = await axios.get(`/api/order/getall/${user.id}`)
                setOrderdata(response.data.orderitems)
            } catch (err) {
                console.log(err)
            }finally{
                setLoading(false)
            }
        }
        fetchorderData()
    }, [])
    return (
        <div className='mt-24 relative mx-8'>
            {loading&&<Loader/>}
            <div className='text-center mb-8 text-3xl font-semibold'>
                Total Number of orders:{orderdata.length}
            </div>
            <div>
                {orderdata.length === 0 && (<p className="text-red-500 text-center font-semibold text-xl mt-4">No Orders to display</p>)}
                {orderdata.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {orderdata.map((item) => (
                            <Ordercard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default page
"use client"
import Loader from '@/components/Loader';
import Ordercard from '@/components/Ordercard';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

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

const Page = () => {
    const [orderdata, setOrderdata] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchOrderData = async () => {
            setLoading(true); // Start loading
            try {
                const response = await axios.get('/api/admin/order/getall');
                setOrderdata(response.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false); // Stop loading after fetch
            }
        };
        fetchOrderData();
    }, []);

    return (
        <div className='mt-24 relative mx-8'>
            {loading && <Loader />} {/* Show loader while loading */}
            <div className='text-center mb-8 text-3xl font-semibold'>
                Total Number of orders: {orderdata.length}
            </div>
            <div>
                {orderdata.length === 0 && !loading && (
                    <p className="text-red-500 text-center font-semibold text-xl mt-4">No Orders to display</p>
                )}
                {orderdata.length > 0 && (
                    <div className="flex flex-wrap gap-4">
                        {orderdata.map((item) => (
                            <Ordercard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;

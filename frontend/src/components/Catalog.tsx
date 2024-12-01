"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Homecard from "./Homecard";
import Loader from "./Loader";

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

const Catalog:React.FC<{}> =({}) => {
    const [formData, setFormData] = useState<ClothItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await axios.get("/api/getall");
                setFormData(response.data);
            } catch (err) {
                console.log(err);
            }finally{
                setLoading(false)
            }
        };
        fetchData();
    }, []);

    return (
        <div className="max-h-screen flex flex-col gap-4">
            {loading&&<Loader/>}
            <div className="text-4xl font-semibold text-center">
                Select the cloth
            </div>

            <div className="bg-white rounded-xl p-5">
                {formData.length === 0 && (
                    <p className="text-red-500 font-semibold">
                        No items to display
                    </p>
                )}

                {formData.length > 0 && (
                    <div
                        className="flex flex-wrap gap-8 overflow-y-auto"
                        style={{
                            maxHeight: "calc(2 * 15rem + 2rem)", // Adjust based on card height + gaps
                        }}
                    >
                        {formData.map((item) => (
                            <Homecard key={item._id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Catalog;

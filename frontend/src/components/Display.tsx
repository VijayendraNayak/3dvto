"use client";
import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
import Loader from "./Loader";
import ModelViewer from "./ModelViewer";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { toast, Toaster } from "sonner";
import { FaCartShopping } from "react-icons/fa6";

const Display: React.FC<{ imglink: string, modellink: string }> = ({ imglink, modellink }) => {
    // Use useCallback to memoize the functions
    const [isClicked, setIsClicked] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const user = useSelector((state: RootState) => state.auth.user);
    const cloth = useSelector((state: RootState) => state.cloth.cloth);

    // Memoize formData creation
    const formData = useMemo(() => {
        if (!user || !cloth) return null;
        return {
            user_id: user.id,
            cloth: {
                _id: cloth.id,
                name: cloth.name,
                category: cloth.category,
                price: cloth.price,
                color: cloth.color,
                sizes: cloth.sizes,
                thumbnail_path: cloth.thumbnail_path,
            },
            quantity: 1,
        };
    }, [user, cloth]);

    // Rest of the component remains the same...



    const handleButtonClick = async () => {
        setIsClicked(true);
        try {
            setError(null);
            setLoading(true);

            const createModelResponse = await axios.post(
                "http://localhost:5000/api/create-3d-model",
                {
                    image_url: modellink,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (createModelResponse.data.success) {
                const taskId = createModelResponse.data.task_id;
                const taskResponse = await axios.get(
                    `http://127.0.0.1:5000/api/check-task-status/${taskId}`
                );

                if (taskResponse.status === 200 && taskResponse.data.success) {
                    const taskStatus = taskResponse.data.result.status;

                    if (taskStatus === "SUCCEEDED") {
                        const newModelUrl = taskResponse.data.result.model_url;
                        setModelUrl(newModelUrl);
                    }
                } else {
                    setError("Failed to fetch task status.");
                }
            } else {
                setError("Failed to create the 3D model. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during the upload.");
        } finally {
            setLoading(false);
        }
    };
    const handleCartClick = async () => {
        setLoading(true);
        try {
            const response = await axios.post("/api/cart/add", formData)
            if (response.status === 201) {
                toast.success("Item added to cart successfully", {
                    position: "top-right",
                    duration: 2000
                })
            } else {
                toast.error("Error adding item to the cart", {
                    position: "top-right",
                    duration: 2000
                })
            }
        } catch (err) {
            console.log(err)
            toast.error("Error adding item", {
                position: "top-right",
                duration: 2000
            })
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col relative items-center justify-center h-screen mt-12 px-4">
            <Toaster richColors />
            {loading && <Loader />}
            <div className="flex w-full h-full">
                {/* Left Section */}
                <div
                    className={`transition-all duration-500 ${isClicked ? "w-1/2" : "w-full"
                        } flex justify-center items-center p-4`}
                >
                    {
                        imglink &&
                        <img
                            src={imglink}
                            alt="2D Image"
                            className="max-w-full max-h-full object-contain"
                        />
                    }
                </div>

                {/* Right Section */}
                {isClicked && (
                    <div className="w-1/2 flex justify-center items-center p-4">
                        <ModelViewer modelUrl={modelUrl} />
                    </div>
                )}
            </div>
            <div className="flex justify-center items-center mb-12">
                {!isClicked ? (
                    <button
                        onClick={handleButtonClick}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                        Convert to 3D
                    </button>
                ) :
                    (
                        <button
                            onClick={handleCartClick}
                            className="px-4 py-2 flex items-center gap-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                            Add to cart <FaCartShopping className="text-white " />

                        </button>
                    )
                }
            </div>
        </div>
    );
};

export default Display;
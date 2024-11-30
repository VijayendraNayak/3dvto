"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { RiCheckboxCircleLine } from "react-icons/ri";
import Catalog from "./Catalog";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { uploadImage } from "../../store/slices/imageSlice";

const UploadImage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<boolean | null>(false)
    const [loading, setLoading] = useState<boolean | null>(false)
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const router = useRouter();
    const dispatch = useDispatch();

    const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
        if (selectedFile) {
            const preview = URL.createObjectURL(selectedFile);
            setPreviewUrl(preview);
            setError(null);
        }
    };

    const handleImageUpload = async () => {
        if (!isAuthenticated) {
            toast.warning("The user should be Authenticated to access the resource", {
                position: "top-right",
                duration: 2000
            })
            setTimeout(() => {
                router.push('/login'); // Redirect to login if not authenticated
            }, 2000)
            return;
        }

        if (!file) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setError(null);
            setLoading(true);
            const uploadResponse = await axios.post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const uploadUrl = uploadResponse.data.url;
            if (uploadUrl) {
                dispatch(uploadImage({ image: uploadUrl }))
                setUploaded(true);
                toast.success("Image uploaded successfully", {
                    position: "top-right",
                    duration: 2000,
                });
            } else {
                setError("Upload failed. Please try again.");
                toast.error("Image upload unsuccessful", {
                    position: "top-right",
                    duration: 2000,
                });
            }
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("An error occurred during the upload.");
            toast.error("An error occurred during the upload.", {
                position: "top-right",
                duration: 2000,
            });
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col bg-gray-400 bg-opacity-30 mt-20">
            <div className="flex flex-row ">
                <section className=" flex-1 relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center  px-4">
                    <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-8 md:px-12 lg:py-20">
                        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
                            Upload Image
                        </h2>
                        <div className="relative bg-white border-2  text-center border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                            <div className="text-center">
                                <img
                                    src="/upload.png"
                                    alt="Upload Icon"
                                    className="mb-4 w-12 md:w-16 h-12 md:h-16 mx-auto"
                                />
                                <p className="text-sm md:text-base text-gray-500 mb-4">
                                    Drag an image here or click to upload
                                </p>
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Choose Image
                                </label>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleImageSelection}
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 mt-4 text-sm">
                                    {error}
                                </p>
                            )}
                            {previewUrl && (
                                <div className="mt-6 w-full flex justify-center">
                                    <img
                                        src={previewUrl}
                                        className="w-auto max-h-64 object-contain rounded-md border border-gray-300"
                                        alt="Selected Preview"
                                    />
                                </div>
                            )}
                            {
                                previewUrl && (
                                    <button
                                        onClick={handleImageUpload}
                                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                    >
                                        {
                                            loading ? "uploading..." : "Upload Image"
                                        }
                                    </button>
                                )
                            }
                            {uploaded && (<p className="text-green-500 flex gap-2 mt-2 font-semibold items-center"><RiCheckboxCircleLine className="text-green-500" /> Image uploaded successfully</p>)}
                        </div>
                        <Toaster richColors />
                    </div>
                </section>
                <section className="flex-1 relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center px-4">
                    <Catalog />
                </section>
            </div>
            <div className="flex flex-col bg-gray-400 bg-opacity-30 min-h-screen">
                <div className="flex justify-center">
                    <button className="bg-gradient-to-r from-green-400 to-green-500 hover:bg-gradient-to-r hover:from-green-400 hover:to-green-500 px-12 py-4 font-semibold text-white text-xl rounded-full cursor-pointer transform hover:scale-105 hover:shadow-lg transition duration-200">
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadImage;
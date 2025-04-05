"use client";
import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { RiCheckboxCircleLine } from "react-icons/ri";
import Catalog from "./Catalog";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { uploadImage } from "../../store/slices/imageSlice";
import Loader from "./Loader";
import Display from "./Display";

const UploadImage: React.FC = () => {
    // State declarations
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [display, setDisplay] = useState<boolean>(false);
    const [wrappedurl, setWrappedurl] = useState<string | null>(null);
    const [hide, setHide] = useState<boolean>(false);

    // Refs and Hooks
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const dispatch = useDispatch();

    // Selectors
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isClothSelected = useSelector((state: RootState) => state.cloth.isClothSelected);
    const image = useSelector((state: RootState) => state.image.image);
    const cloth = useSelector((state: RootState) => state.cloth.cloth);

    // Scroll effect on loading
    useEffect(() => {
        if (loading) {
            const height = window.innerHeight;
            const scrollheight = height * 0.90;
            window.scrollTo({
                top: window.scrollY + scrollheight,
                behavior: "smooth"
            });
        }
    }, [loading]);

    // Handle image file selection
    const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0] || null;
        setFile(selectedFile);
        
        if (selectedFile) {
            const preview = URL.createObjectURL(selectedFile);
            setPreviewUrl(preview);
            setError(null);
        }
    };

    // Image upload handler
    const handleImageUpload = async () => {
        // Authentication check
        if (!isAuthenticated) {
            toast.warning("Please authenticate to access this resource", {
                position: "top-right",
                duration: 2000
            });
            setTimeout(() => router.push('/login'), 2000);
            return;
        }

        // File validation
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
                headers: { "Content-Type": "multipart/form-data" },
            });

            const uploadUrl = uploadResponse.data.url;
            if (uploadUrl) {
                dispatch(uploadImage({ image: uploadUrl }));
                setUploaded(true);
                toast.success("Image uploaded successfully", {
                    position: "top-right",
                    duration: 2000,
                });
            } else {
                throw new Error("Upload failed");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during upload.");
            toast.error("Upload unsuccessful", {
                position: "top-right",
                duration: 2000,
            });
        } finally {
            setLoading(false);
        }
    };

    // Direct try-on with FAL API only - no background removal or cartoonization
    const handleProceedClick = async () => {
        if (loading) return;
    
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, 30000);
    
        try {
            console.log("[DEBUG] Starting virtual try-on...");
    
            // Reset states
            setError(null);
            setDisplay(false);
            setLoading(true);
            setWrappedurl(null);
    
            console.log("[DEBUG] cloth.thumbnail_path:", cloth.thumbnail_path);
            console.log("[DEBUG] image.image:", image.image);
    
            // Build request payload
            const requestData = {
                garment_image_url: cloth?.thumbnail_path,
                human_image_url: image?.image,
                cloth_type: "upper",
                skip_background_removal: true
            };
    
            console.log("[DEBUG] Request Payload:", requestData);
    
            // Axios call
            try {
                const response = await axios.post("/api/tryon", requestData, {
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    timeout: 30000
                });
    
                console.log("[DEBUG] API Response:", response.data);
    
                const imageUrl = response.data?.result?.image?.url;
                if (!imageUrl || typeof imageUrl !== "string") {
                    throw new Error("Invalid image URL received");
                }
    
                setWrappedurl(imageUrl);
                setDisplay(true);
                setUploaded(true);
                setHide(false);
    
                toast.success("Virtual try-on completed", {
                    position: "top-right",
                    duration: 2000,
                });
    
            } catch (requestError) {
                console.error("[DEBUG] API Error:", requestError);
    
                if (axios.isCancel(requestError)) {
                    toast.error("Request timed out. Please try again.", {
                        position: "top-right",
                        duration: 2000,
                    });
                    throw new Error("Request cancelled");
                }
                throw requestError;
            }
    
        } catch (error) {
            console.error("Processing Error:", error);
    
            if (axios.isCancel(error)) {
                toast.error("Operation was cancelled. Please try again.", {
                    position: "top-right",
                    duration: 2000,
                });
                setError("Operation cancelled. Please try again.");
            } else if (error instanceof Error) {
                toast.error(error.message || "Failed to process image", {
                    position: "top-right",
                    duration: 2000,
                });
                setError(error.message || "Processing failed. Please try again.");
            } else {
                toast.error("An unexpected error occurred", {
                    position: "top-right",
                    duration: 2000,
                });
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    };
    

    return (
        <div className="flex flex-col bg-gray-400 bg-opacity-30 mt-20">
            {loading && <Loader />}
            
            <div className="flex flex-row">
                {/* Image Upload Section */}
                <section className="flex-1 relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center px-4">
                    <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-8 md:px-12 lg:py-20">
                        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
                            Upload Image
                        </h2>
                        <div className="relative bg-white border-2 text-center border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                            {/* File Upload UI */}
                            <div className="text-center">
                                <img
                                    src="/upload.png"
                                    alt="Upload Icon"
                                    className="mb-4 w-12 md:w-16 h-12 md:h-16 mx-auto"
                                />
                                <p className="text-sm md:text-base text-gray-500 mb-4">
                                    Drag an image here or click to upload
                                </p>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleImageSelection}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Choose Image
                                </label>
                            </div>

                            {/* Error and Preview */}
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

                            {/* Upload Button */}
                            {previewUrl && (
                                <button
                                    onClick={handleImageUpload}
                                    disabled={loading}
                                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                >
                                    {loading ? "Uploading..." : "Upload Image"}
                                </button>
                            )}

                            {uploaded && (
                                <p className="text-green-500 flex gap-2 mt-2 font-semibold items-center">
                                    <RiCheckboxCircleLine className="text-green-500" /> 
                                    Image uploaded successfully
                                </p>
                            )}
                        </div>
                        <Toaster richColors />
                    </div>
                </section>

                {/* Catalog Section */}
                <section className="flex-1 relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center px-4">
                    <Catalog />
                </section>
            </div>

            {/* Proceed Section */}
            {uploaded && isClothSelected && !hide && (
                <div className="flex flex-col gap-8 bg-gray-400 bg-opacity-30 min-h-screen">
                    <div className="flex justify-center flex-col">
                        <button
                            className="bg-gradient-to-r from-purple-400 w-80 to-purple-500 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-500 px-12 py-4 font-semibold text-white text-2xl mx-auto rounded-full cursor-pointer transform hover:scale-105 hover:shadow-lg transition duration-200"
                            onClick={handleProceedClick}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Proceed'}
                        </button>
                    </div>

                    {/* Display Section */}
                    {display && wrappedurl && (
                        <Display 
                            imglink={wrappedurl} 
                            modellink={wrappedurl} // Using the same wrapped image URL for both props
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default UploadImage;
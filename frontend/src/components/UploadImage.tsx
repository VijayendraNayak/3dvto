"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";
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
    const [file, setFile] = useState<File | null>(null);
    const [wrappedfile, setWrappedfile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploaded, setUploaded] = useState<boolean | null>(false)
    const [loading, setLoading] = useState<boolean | null>(false)
    const [index, setIndex] = useState<number>(1);
    const [display, setDisplay] = useState<boolean>(false)
    const [threedurl, setThreedurl] = useState<string | null>(null)
    const [wrappedurl, setWrappedurl] = useState<string | null>(null)
    const [hide, setHide] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const isClothSelected = useSelector((state: RootState) => state.cloth.isClothSelected);
    const image = useSelector((state: RootState) => state.image.image);
    const cloth = useSelector((state: RootState) => state.cloth.cloth)

    const router = useRouter();
    const dispatch = useDispatch();
    const handleProceedClick = async () => {
        // Prevent multiple clicks while processing
        if (loading) return;

        try {
            // Smooth scroll
            const height = window.innerHeight;
            const scrollheight = height * 0.90;
            window.scrollTo({
                top: window.scrollY + scrollheight,
                behavior: "smooth"
            });

            // Reset states before starting
            setError(null);
            setDisplay(true);
            setLoading(true);

            // Step 1: Try-on API to get wrapped image URL
            const requestData = {
                garment_url: cloth.thumbnail_path,
                human_url: image.image,
                category: "upper_body",
            };

            // Send request to try-on API
            const response = await axios.post("/api/tryon", requestData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            // Extract the wrapped image URL
            const imageUrl = response.data.img.img;

            // Validate the URL
            if (!imageUrl || typeof imageUrl !== 'string') {
                throw new Error("Invalid image URL received");
            }

            // Step 2: Fetch the wrapped image and convert to File
            const imageResponse = await axios.get(imageUrl, {
                responseType: 'blob',
                timeout: 10000
            });

            // Create a File object from the blob
            const wrappedImageFile = new File(
                [imageResponse.data],
                "wrapped_image.jpg",
                { type: imageResponse.headers['content-type'] || 'image/jpeg' }
            );

            // Update wrapped URL state
            setWrappedurl(imageUrl);
            setWrappedfile(wrappedImageFile);

            // Step 3: Prepare for cartoonization
            const formData = new FormData();
            formData.append("image", wrappedImageFile);
            formData.append("index", String(index));

            // Send request to start cartoonization
            const cartoonizeResponse = await axios.post("/api/cartoonize", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            // Extract task ID for tracking
            const task_id = cartoonizeResponse.data.task_id;

            if (task_id) {
                // Notify user that processing is starting
                toast.info("Your image is being processed. Please wait...", {
                    position: "top-right",
                    duration: 3000,
                });

                // Wait for processing to complete
                await new Promise(resolve => setTimeout(resolve, 30000));

                // Retrieve the processed image
                const uploadResponse = await axios.get('/api/get_result', {
                    params: { task_id: task_id }
                });

                const { status, image_url, result_url } = uploadResponse.data;

                // Handle successful processing
                if (status === 'success' || status === 'PROCESS_SUCCESS' || status === 'COMPLETED') {
                    const processingUrl = image_url || result_url;

                    if (processingUrl) {
                        // Set the final 3D URL and mark as uploaded
                        setThreedurl(processingUrl);
                        setUploaded(true);
                        setHide(false);  

                        toast.success("Image processed successfully", {
                            position: "top-right",
                            duration: 2000,
                        });
                    } else {
                        throw new Error('No image URL received');
                    }
                } else {
                    throw new Error('Processing failed');
                }
            } else {
                // Handle case where task_id is not received
                throw new Error("Failed to start the cartoonization job");
            }
        } catch (error) {
            // Comprehensive error handling
            console.error("Complete Error:", error);

            // Set error state and show toast
            setError("An error occurred during processing");
            toast.error("Failed to process image. Please try again.", {
                position: "top-right",
                duration: 2000,
            });
        } finally {
            // Ensure loading state is reset
            setLoading(false);
        }
    };

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
            {loading && <Loader />}
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
            {uploaded && isClothSelected && !hide && (
                <div className="flex flex-col gap-8 bg-gray-400 bg-opacity-30 min-h-screen">
                    <div className="flex justify-center flex-col">
                        <button
                            className="bg-gradient-to-r from-purple-400 w-80 to-purple-500 hover:bg-gradient-to-r hover:from-purple-400 hover:to-purple-500 px-12 py-4 font-semibold text-white text-2xl mx-auto rounded-full cursor-pointer transform hover:scale-105 hover:shadow-lg transition duration-200"
                            onClick={handleProceedClick}
                        >
                            Proceed
                        </button>
                    </div>

                    {uploaded && isClothSelected && !hide && (
                        <div className="flex flex-col gap-8 bg-gray-400 bg-opacity-30 min-h-screen">
                            {display && <Display imglink={wrappedurl} modellink={threedurl} />}
                        </div>
                    )}
                </div>
            )}


        </div>
    );
};

export default UploadImage;
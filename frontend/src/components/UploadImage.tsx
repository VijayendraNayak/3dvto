"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import ModelPopup from './ModelPopup'; // Import the new ModelPopup component

const UploadImage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [status, setStatus] = useState("PENDING");
    const [result, setResult] = useState<any>(null);
    const [showModelPopup, setShowModelPopup] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsConverting(true);
            setError(null);

            // Step 1: Upload the file
            const uploadResponse = await axios.post("/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log(uploadResponse.data.url)
            const uploadUrl = uploadResponse.data.url;

            if (uploadUrl) {
                // Step 2: Create 3D model
                const createModelResponse = await axios.post(
                    "http://localhost:5000/api/create-3d-model",
                    {
                        image_url: uploadUrl,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                if (createModelResponse.data.success) {
                    const newTaskId = createModelResponse.data.task_id;
                    setTaskId(newTaskId);

                    // Step 3: Poll task status
                    const url = `http://127.0.0.1:5000/api/check-task-status/${newTaskId}`;
                    const taskResponse = await axios.get(url);

                    if (taskResponse.status === 200) {
                        const data = taskResponse.data;

                        if (data.success) {
                            const taskStatus = data.result.status;
                            setStatus(taskStatus);

                            if (["SUCCEEDED", "FAILED", "EXPIRED"].includes(taskStatus)) {
                                setResult(data.result);
                                if (taskStatus === "SUCCEEDED") {
                                    const newModelUrl = data.result.model_url;
                                    console.log(data.result)
                                    setModelUrl(newModelUrl);
                                    setShowModelPopup(true); // Show popup when model is ready
                                }
                                return;
                            }
                        } else {
                            setError("Failed to fetch task status.");
                        }
                    } else {
                        setError(`Error: ${taskResponse.statusText}`);
                    }
                } else {
                    setError("Failed to create the 3D model. Please try again.");
                }
            } else {
                setError("Upload failed. Please try again.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred during the upload.");
        } finally {
            setIsConverting(false);
        }
    };

    const closeModelPopup = () => {
        setShowModelPopup(false);
    };


    return (
        <>
            <section className="relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center mt-20 px-4">
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

                        {previewUrl && (
                            <button
                                onClick={handleImageUpload}
                                disabled={isConverting}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                            >
                                {isConverting ? "Converting..." : "Convert to 3D"}
                            </button>
                        )}

                        {modelUrl && (
                            <div className="mt-4">
                                <a
                                    href={modelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    View 3D Model
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>
            {modelUrl && showModelPopup && (
                <ModelPopup
                    modelUrl={modelUrl}
                    onClose={closeModelPopup}
                />
            )}
        </>
    );
};

export default UploadImage;
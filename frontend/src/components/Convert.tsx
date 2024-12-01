"use client";
import React, { useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import ModelPopup from './ModelPopup'; // Import the new ModelPopup component
import Loader from "./Loader";

const Convert: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConverting, setIsConverting] = useState<boolean>(false);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [status, setStatus] = useState("PENDING");
    const [result, setResult] = useState<any>(null);
    const [showModelPopup, setShowModelPopup] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);


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
            setLoading(true)

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
            setLoading(false)
        }
    };

    const closeModelPopup = () => {
        setShowModelPopup(false);
    };


    return (
        <>
            {loading && <Loader />}
            <div className="bg-gradient-to-r from-blue-300 to-blue-500 hover:from-blue-400 hover:to-blue-600 px-4 py-3 font-semibold text-white rounded-lg cursor-pointer transform hover:scale-105 hover:shadow-lg transition duration-200"
                onClick={handleImageUpload}>
                Convert to 3D
            </div>
            {modelUrl && showModelPopup && (
                <ModelPopup
                    modelUrl={modelUrl}
                    onClose={closeModelPopup}
                />
            )}
        </>
    );
};

export default Convert;
"use client";
import axios from "axios";
import React, { useState } from "react";
import Loader from "./Loader";
import ModelViewer from "./ModelViewer";

const Display: React.FC<{ imglink: string }> = ({ imglink }) => {
    const [isClicked, setIsClicked] = useState(false);
    const [url, setUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [modelUrl, setModelUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleButtonClick = async () => {
        setIsClicked(true);
        try {
            setError(null);
            setLoading(true);

            const createModelResponse = await axios.post(
                "http://localhost:5000/api/create-3d-model",
                {
                    image_url: url,
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

    return (
        <div className="flex flex-col items-center justify-center h-screen px-4">
            {loading && <Loader />}
            <div className="flex w-full h-full">
                {/* Left Section */}
                <div
                    className={`transition-all duration-500 ${isClicked ? "w-1/2" : "w-full"
                        } flex justify-center items-center p-4`}
                >
                    <img
                        src={imglink}
                        alt="2D Image"
                        className="max-w-full max-h-full object-contain"
                    />
                </div>

                {/* Right Section */}
                {isClicked && (
                    <div className="w-1/2 flex justify-center items-center p-4">
                        <ModelViewer modelUrl={modelUrl || ""} />
                    </div>
                )}
            </div>
            <div className="flex justify-center items-center mt-4">
                {/* Button positioned to stay at the bottom */}
                {!isClicked && (
                    <button
                        onClick={handleButtonClick}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                    >
                        Convert to 3D
                    </button>
                )}
            </div>
        </div>
    );
};

export default Display;

import React from 'react'

type Props = {}

const UploadImage = (props: Props) => {
    function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>): void {
        const inputElement = event.target;

        if (!inputElement || !inputElement.files || inputElement.files.length === 0) {
            resetPreview();
            return;
        }

        const file = inputElement.files[0];
        const errorMessage = document.getElementById("error-message") as HTMLElement | null;
        const previewImage = document.getElementById("image-preview") as HTMLImageElement | null;

        if (!errorMessage || !previewImage) {
            console.error("Error message or preview image element not found.");
            return;
        }

        // Check if the file is an image
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function (e: ProgressEvent<FileReader>) {
                if (e.target && e.target.result) {
                    previewImage.src = e.target.result as string;
                    previewImage.classList.remove("hidden");
                    errorMessage.classList.add("hidden");
                }
            };
            reader.readAsDataURL(file);
        } else {
            // Show an error message for non-image files
            previewImage.classList.add("hidden");
            previewImage.src = "";
            errorMessage.classList.remove("hidden");
            errorMessage.textContent = "Only image files are allowed.";
        }
    }

    // Helper function to reset preview and error message
    function resetPreview(): void {
        const errorMessage = document.getElementById("error-message") as HTMLElement | null;
        const previewImage = document.getElementById("image-preview") as HTMLImageElement | null;

        if (errorMessage) errorMessage.classList.add("hidden");
        if (previewImage) {
            previewImage.classList.add("hidden");
            previewImage.src = "";
        }
    }

    return (
        <section
            id="second-section"
            className="relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center mt-20 px-4"
        >
            <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-8 md:px-12 lg:py-20">
                <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
                    Upload Image
                </h2>
                <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                    {/* Upload Icon */}
                    <div className="text-center">
                        <img
                            src="/upload.png"
                            alt="Upload Icon"
                            className="mb-4 w-12 md:w-16 h-12 md:h-16 sm:ml-16 lg:ml-28"
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
                            className="hidden"
                            onChange={(e) => handleImageUpload(e)}
                        />
                    </div>

                    {/* Error Message */}
                    <p id="error-message" className="hidden text-red-500 mt-4 text-sm">
                        Please upload a valid image file.
                    </p>

                    {/* Image Preview */}
                    <div
                        id="image-preview-container"
                        className="mt-6 w-full flex justify-center"
                    >
                        <img
                            id="image-preview"
                            className="hidden w-auto max-h-64 object-contain rounded-md border border-gray-300"
                            alt="Selected Preview"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default UploadImage
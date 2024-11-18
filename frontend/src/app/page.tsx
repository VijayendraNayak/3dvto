'use client';

import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
  const scrollToNextScreen = () => {
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768;
      const scrollDistance = isMobile ? window.innerHeight * 0.95 : window.innerHeight;
      
      // Get the next section element
      const nextSection = document.getElementById('second-section');
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const handleResize = () => {
      console.log("Window resized:", window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //upload image
  function handleImageUpload(event) {
    const file = event.target.files[0];
    const errorMessage = document.getElementById("error-message");
    const previewImage = document.getElementById("image-preview");

    if (file) {
      // Check if the file is a valid JPEG image
      if (file.type === "image/jpeg") {
        const reader = new FileReader();
        reader.onload = function (e) {
          // Display the preview image
          previewImage.src = e.target.result;
          previewImage.classList.remove("hidden");
          errorMessage.classList.add("hidden");
        };
        reader.readAsDataURL(file);
      } else {
        // Show an error message for invalid files
        previewImage.classList.add("hidden");
        errorMessage.classList.remove("hidden");
      }
    } else {
      // Reset everything if no file is selected
      previewImage.classList.add("hidden");
      previewImage.src = "";
      errorMessage.classList.add("hidden");
    }
  }

  return (
    <main className="min-h-screen">
  {/* First Section */}
  <section className="relative max-w-7xl mt-20 mx-auto flex flex-col lg:flex-row gap-10 lg:gap-20 justify-between items-center px-6 lg:px-0 h-auto lg:h-[calc(100vh-160px)]">
    <div className="flex flex-col gap-6">
      {/* Logo */}
      <div className="flex bg-white bg-opacity-75 border px-6 items-center gap-8 shadow-xl hover:shadow-2xl justify-center rounded-2xl py-4">
        <Image src="/logo1.png" alt="logo" height={70} width={70} />
        <div className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold">VTO</div>
      </div>

      {/* Interactive Virtual Try-On */}
      <div className="flex bg-white bg-opacity-75 px-4 py-3 gap-3 shadow-xl border hover:shadow-2xl rounded-2xl flex-col">
        <h2 className="text-md md:text-lg font-semibold text-purple-500">Interactive Virtual Try-On</h2>
        <p className="text-sm md:text-base text-gray-600">
          Experience a seamless virtual try-on system for effortless online shopping.
        </p>
      </div>

      {/* 3D Clothing Visualization */}
      <div className="flex bg-white bg-opacity-75 px-4 py-3 border gap-3 shadow-xl hover:shadow-2xl rounded-2xl flex-col">
        <h2 className="text-md md:text-lg font-semibold text-purple-500">3D Clothing Visualization</h2>
        <p className="text-sm md:text-base text-gray-600">
          Visualize how clothes fit and look on a realistic 3D model for precise design previews.
        </p>
      </div>
    </div>

    <div className="flex-1 flex flex-col gap-8 items-start">
      {/* Tagline */}
      <div className="flex flex-col text-center lg:text-left">
        <div>
          <span className="text-4xl md:text-5xl lg:text-6xl text-blue-600 font-semibold">See It</span>
          <span className="text-4xl md:text-5xl lg:text-6xl text-purple-600 font-semibold"> Before You</span>
        </div>
        <span className="text-4xl md:text-5xl lg:text-6xl text-blue-600 font-semibold">Wear It</span>
      </div>

      {/* Description */}
      <span className="text-sm md:text-base text-center lg:text-left">
        Experience the future of shopping with our cutting-edge virtual try-on technology that lets you visualize the perfect fit.
      </span>

      {/* Call-to-Action Button */}
      <button onClick={scrollToNextScreen} className="relative group max-w-fit">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <div className="relative px-6 py-3 md:px-8 md:py-4 bg-white rounded-full leading-none flex items-center">
          <span className="text-purple-600 group-hover:text-purple-700 transition duration-200 font-semibold">
            Get Started Now
          </span>
        </div>
      </button>
    </div>
  </section>

  {/* Second Section */}
  <section
    id="second-section"
    className="relative min-h-screen bg-gray-400 bg-opacity-30 flex items-center justify-center mt-20 px-4"
  >
    <div className="relative max-w-4xl mx-auto px-4 py-16 sm:px-8 md:px-12 lg:py-20">
      <h2 className="text-2xl md:text-4xl font-bold text-center mb-8">
        Upload Image
      </h2>
      <div
        className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center"
      >
        {/* Upload Icon */}
        <div className="text-center">
          <img
            src="/upload.png"
            alt="Upload Icon"
            className="mb-4 w-12 md:w-16 h-12 md:h-16 sm:ml-16 lg:ml-28"
          />
          <p className="text-sm md:text-base text-gray-500 mb-4">
            Drag a JPEG image here or click to upload
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
            accept=".jpeg, .jpg"
            className="hidden"
            onChange={(e) => handleImageUpload(e)}
          />
        </div>

        {/* Error Message */}
        <p id="error-message" className="hidden text-red-500 mt-4 text-sm">
          Please upload a valid JPEG image.
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
</main>
  );
}
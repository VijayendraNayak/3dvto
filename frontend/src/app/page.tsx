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

  return (
    <main className="min-h-screen">
      {/* First Section */}
      <section className="relative max-w-7xl mt-20 flex gap-20 mx-auto justify-between items-center h-[calc(100vh-160px)]">
        <div className="flex flex-col gap-6">
          <div className="flex bg-white bg-opacity-75 border px-6 items-center gap-8 shadow-xl hover:shadow-2xl justify-center rounded-2xl py-4 max-w-fit">
            <Image src="/logo1.png" alt="logo" height={70} width={70} />
            <div className="text-6xl font-serif font-semibold">VTO</div>
          </div>
          <div className="flex bg-white bg-opacity-75 px-3 py-2 gap-3 shadow-xl border hover:shadow-2xl rounded-2xl flex-col">
            <h2 className="text-lg font-semibold text-purple-500">Interactive Virtual Try-On</h2>
            <p className="text-gray-600">
              Experience a seamless virtual try-on system for effortless online shopping.
            </p>
          </div>
          <div className="flex bg-white bg-opacity-75 px-3 py-2 border gap-3 shadow-xl hover:shadow-2xl rounded-2xl flex-col max-w-fit">
            <h2 className="text-lg font-semibold text-purple-500">3D Clothing Visualization</h2>
            <p className="text-gray-600">
              Visualize how clothes fit and look on a realistic 3D model for precise design previews.
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="flex flex-col">
            <div>
              <span className="text-5xl text-blue-600 font-semibold">See It</span>
              <span className="text-5xl text-purple-600 font-semibold"> Before You</span>
            </div>
            <span className="text-5xl text-blue-600 font-semibold">Wear It</span>
          </div>
          <span className="text-lg">
            Experience the future of shopping with our cutting-edge virtual try-on technology that lets you visualize the perfect fit.
          </span>
          <button onClick={scrollToNextScreen} className="relative group max-w-fit">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative px-8 py-4 bg-white rounded-full leading-none flex items-center">
              <span className="text-purple-600 group-hover:text-purple-700 transition duration-200 font-semibold">
                Get Started Now
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Second Section */}
      <section id="second-section" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-bold text-center mb-8">Your Second Section Content</h2>
          {/* Add your content for the second section here */}
        </div>
      </section>
    </main>
  );
}
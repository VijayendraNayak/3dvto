"use client"
import React, { useState, useEffect } from "react";
import "./register.css";
import Link from 'next/link';
import { VscEye } from "react-icons/vsc";
import { VscEyeClosed } from "react-icons/vsc";
import axios from "axios";
import { useRouter } from "next/navigation";



const page: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState<string>("rgba(255, 255, 255, 0.8)");
  const [iseyevis,setIseyevis]=useState(false);
  const router=useRouter();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    adress: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.adress || !formData.phone) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const response = await axios.post("http://127.0.0.1:5000/register", formData);
      if (response.status === 201) {
        alert("User registered successfully!");
        router.push('/pages/login');
        setFormData({
          username: "",
          email: "",
          password: "",
          adress: "",
          phone: "",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        alert(error.response.data.message);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };
  
  const handleEyeclick=()=>{
    setIseyevis(!iseyevis);
  }


  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });

      // Change color dynamically based on mouse position
      const red = (event.clientX / window.innerWidth) * 255;
      const green = (event.clientY / window.innerHeight) * 255;
      const blue = 255 - (red + green) / 2; // Create a dynamic effect based on mouse position

      setColor(`rgb(${red}, ${green}, ${blue})`);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div id="app" className="relative w-full h-screen">
      {/* Color Follower with Dynamic Color */}
      <div
        className="color-follower"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: color, // Dynamic color based on mouse position
        }}
      ></div>

      {/* Main Content */}
      <div
        className="absolute text-black text-center"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="card bg-transparent shadow-lg rounded-lg p-9 sm:p-8 w-11/12 sm:w-96 border border-gray-300 cursor-pointer mt-20">
          <h1 className="font-sans-serif text-sm sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl uppercase tracking-wide font-bold">
            Register
          </h1>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="text-sm sm:text-md font-sans-serif text-left block"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm sm:text-md font-sans-serif text-left block"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm sm:text-md font-sans-serif text-left block"
              >
                Mobile
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Enter your mobile number"
              />
            </div>

            <div>
              <label
                htmlFor="adress"
                className="text-sm sm:text-md font-sans-serif text-left block"
              >
                Adress
              </label>
              <input
                type="text"
                id="adress"
                name="adress"
                value={formData.adress}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Enter your adress"
              />
            </div>


            <div>
              <label
                htmlFor="password"
                className="text-sm sm:text-md block font-sans-serif text-left"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={!iseyevis?"password":"text"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                  placeholder="Enter your password"
                />
                <VscEye
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iseyevis?"flex":"hidden"} cursor-pointer`}
                  onClick={handleEyeclick}
                />
                <VscEyeClosed
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iseyevis?"hidden":"flex"} cursor-pointer`}
                  onClick={handleEyeclick}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 mt-4 bg-gradient-to-r from-purple-500 to-violet-300 text-white rounded-lg hover:from-purple-600 hover:to-violet-400"
            >
              Register
            </button>
          </form>

          <Link href="/pages/login" className="mt-6 sm:mt-10 text-xs sm:text-sm p-3">
            Have an account?
          </Link>
        </div>
      </div>
    </div>

  );
};

export default page;

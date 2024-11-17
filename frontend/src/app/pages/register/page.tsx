"use client";
import React, { useState } from "react";
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
    address: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Handle the registration logic here
    console.log("Registering with", formData);

    if (!formData.username || !formData.email || !formData.password || !formData.address || !formData.phone) {
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
          address: "", // Corrected typo here
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

  return (
    <div className="flex items-center justify-center h-screen w-full relative mt-10">
      {/* Card Container - Adjusting width and z-index */}
      <div className="flex flex-col sm:flex-row w-full sm:w-4/5 lg:w-2/3 xl:w-80px bg-gradient-to-r from-indigo-700 to-purple-900 rounded-lg relative z-10">
        
        {/* Left Section (Image) */}
        <div className="flex justify-center items-center w-full rounded-l-lg p-6">
          <img
            src="/login.png" // Replace with your logo path
            alt="Virtual Try On"
            className="h-100 hidden md:block lg:block xl:block"
          />
        </div>

        {/* Right Section (Form) */}
        <div className="flex flex-col justify-center items-center xl:w-full lg:w-1/2 sm:w-1/2 lg:mr-4 bg-transparent rounded-r-lg ">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center mt-5">
            Register for Virtual Try On
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">

            <div>
              <label
                htmlFor="username"
                className="text-sm sm:text-md font-sans-serif text-left block text-white font-bold"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm sm:text-md font-sans-serif text-left block text-white font-bold"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm sm:text-md font-sans-serif text-left block text-white font-bold"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="text-sm sm:text-md font-sans-serif text-left block text-white font-bold"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}

                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your address"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm sm:text-md block font-sans-serif text-left text-white font-bold"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                placeholder="Enter your password"
              />

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

          <div className=" text-center p-1">
            <Link href="/pages/login" className="text-sm text-white hover:underline">
              Already have an account? Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

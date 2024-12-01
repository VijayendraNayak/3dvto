"use client";
import React, { useState } from "react";
import "./register.css";
import Link from 'next/link';
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Toaster, toast } from 'sonner';
import Loader from "@/components/Loader";

const page: React.FC = () => {
  const [iseyevis, setIseyevis] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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
    
    // Form validation
    if (!formData.username || !formData.email || !formData.password || !formData.address || !formData.phone) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    
    // Password validation
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }
    
    try {
      setLoading(true)
      toast.loading("Registering user...");
      const response = await axios.post("/api/register", formData);
      
      if (response.status === 201) {
        toast.success("Registration successful! Redirecting to login...", {
          position: "top-center",
          duration: 2000,
        });
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);

        setFormData({
          username: "",
          email: "",
          password: "",
          address: "",
          phone: "",
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Registration failed", {
          position: "top-center",
          duration: 3000,
        });
      } else {
        toast.error("An unexpected error occurred", {
          position: "top-center",
          duration: 3000,
        });
      }
    }finally{
      setLoading(false)
    }
  };

  const handleEyeclick = () => {
    setIseyevis(!iseyevis);
  }

  return (
    <>
      <Toaster richColors closeButton />
      {loading&&<Loader/>}
      <div className="flex items-center justify-center w-full relative mt-28">
        <div className="flex flex-col sm:flex-row w-full sm:w-4/5 lg:w-2/3 xl:w-80px bg-gray-400 bg-opacity-30 relative rounded-2xl z-10">
          <div className="flex justify-center items-center w-full rounded-l-lg p-6">
            <img
              src="/login.png"
              alt="Virtual Try On"
              className="h-100 hidden md:block lg:block xl:block"
            />
          </div>

          <div className="flex flex-col justify-center items-center xl:w-full lg:w-1/2 sm:w-1/2 lg:mr-4 bg-transparent rounded-r-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-500 text-center mt-4">
              Register for Virtual Try On
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
              <div>
                <label htmlFor="username" className="text-sm sm:text-md font-sans-serif text-left block text-purple-500 font-bold">
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
                <label htmlFor="email" className="text-sm sm:text-md font-sans-serif text-left block text-purple-500 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => toast.info("Email adress should be unique", { duration: 2000 })}
                  className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="text-sm sm:text-md font-sans-serif text-left block text-purple-500 font-bold">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onFocus={() => toast.info("Enter a 10-digit phone number", { duration: 2000 })}
                  className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="address" className="text-sm sm:text-md font-sans-serif text-left block text-purple-500 font-bold">
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
                <label htmlFor="password" className="text-sm sm:text-md block font-sans-serif text-left text-purple-500 font-bold">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={!iseyevis ? "password" : "text"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => toast.info("Password must be at least 8 characters", { duration: 2000 })}
                    className="w-full px-4 py-2 mt-2 border border-black text-black font-bold rounded-lg"
                    placeholder="Enter your password"
                  />
                  <VscEye
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iseyevis ? "flex" : "hidden"} cursor-pointer`}
                    onClick={handleEyeclick}
                  />
                  <VscEyeClosed
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${iseyevis ? "hidden" : "flex"} cursor-pointer`}
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

            <div className="text-center p-1">
              <Link href="/login" className="text-sm text-yellow-600 hover:underline">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default page;
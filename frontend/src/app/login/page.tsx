"use client";
import React, { useState } from "react";
import "./login.css";
import Link from "next/link";
import axios from "axios";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "../../../store/slices/authSlice";
import Cookies from "js-cookie";
import Loader from "@/components/Loader";

const Page: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [iseyevis, setIseyevis] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEyeclick = () => {
    setIseyevis(!iseyevis);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long", {
        position: "top-center",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true); // Start loader
      toast.loading("Logging in the user...");
      const response = await axios.post("/api/login", formData);
      const data = response.data.data;

      if (response.status === 200) {
        Cookies.set("loggedin", "true", { expires: 7, path: "/" });
        Cookies.set("role", data.role, { expires: 7, path: "/" });

        toast.success("Login successful! Redirecting to the home page...", {
          position: "top-center",
          duration: 2000,
        });

        setTimeout(() => {
          if (data.role === "admin") router.push("/admin/dashboard");
          else router.push("/");
        }, 2000);

        setFormData({ email: "", password: "" });

        // Dispatch login state to Redux
        dispatch(
          login({
            email: data.email,
            id: data.id,
            role: data.role,
            name: data.name,
            phone: data.phone,
            address: data.address,
          })
        );
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Login failed", {
          position: "top-center",
          duration: 3000,
        });
      } else {
        toast.error("An unexpected error occurred", {
          position: "top-center",
          duration: 3000,
        });
      }
    } finally {
      setLoading(false); // Stop loader
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full relative">
      <Toaster richColors closeButton />

      {/* Loader */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center z-50">
          <Loader />
        </div>
      )}

      {/* Card Container */}
      <div className="flex flex-col sm:flex-row w-full sm:w-4/5 lg:w-2/3 xl:w-1/2 bg-gray-400 bg-opacity-30 rounded-xl relative z-10">
        {/* Left Section (Image) */}
        <div className="flex justify-center items-center w-full rounded-l-lg p-6 md:block lg:block xl:block">
          <img
            src="/login.png"
            alt="Virtual Try On"
            className="h-100 hidden md:block lg:block xl:block"
          />
        </div>

        {/* Right Section (Form) */}
        <div className="flex flex-col justify-center items-center xl:w-full lg:w-1/2 sm:w-1/2 bg-transparent rounded-r-lg p-5">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-500 mb-4 text-center">
            Log in to Virtual Try On
          </h2>
          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm sm:text-md font-sans-serif text-left block text-purple-500 font-bold"
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
                htmlFor="password"
                className="text-sm sm:text-md block font-sans-serif text-left text-purple-500 font-bold"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={!iseyevis ? "password" : "text"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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
              Login
            </button>
          </form>

          <div className="mt-2 text-center">
            <Link href="/register" className="text-sm text-yellow-600 hover:underline">
              Create new account?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

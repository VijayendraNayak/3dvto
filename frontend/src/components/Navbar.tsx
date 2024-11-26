"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaPowerOff } from "react-icons/fa";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { CgProfile } from "react-icons/cg";
import { FaCartShopping } from "react-icons/fa6";
import { useRouter } from "next/navigation";

type Props = {};

const Navbar = (props: Props) => {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useSelector((state: RootState) => state.auth.user) || null;
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    // Ensure this component only renders on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null; // Avoid rendering during SSR
    }

    return (
        <div className="fixed top-0 left-0 z-50 w-full py-2 bg-gradient-to-r from-purple-200 to-purple-300 border-b-4 border-purple-800 flex justify-around items-center shadow-xl">
            <div className="flex items-center gap-4">
                <Link
                    href={(isAuthenticated && user.role === "user") ? "/" : "/admin/dashboard"}
                    className="flex cursor-pointer items-center gap-4 px-4 bg-white shadow-lg hover:shadow-xl opacity-90 rounded-xl p-2"
                >
                    <Image src="/logo1.png" alt="logo" width={48} height={48} />
                    <span className="font-semibold text-4xl font-serif">VTO</span>
                </Link>
            </div>
            {!isAuthenticated ? (
                <div>
                    <Link
                        href="/login"
                        className="p-3 bg-purple-500 shadow-lg hover:shadow-xl hover:bg-purple-600 flex cursor-pointer items-center gap-2 rounded-xl px-6 text-white font-sans font-semibold"
                    >
                        <FaPowerOff /> Login
                    </Link>
                </div>
            ) : (
                <div className="flex gap-16 items-center cursor-pointer">
                    <div
                        className="flex gap-2"
                        onClick={() => { router.push('/profile') }}
                    >
                        <CgProfile className="text-3xl font-semibold" />
                        <span className="text-xl">{user?.name}</span>
                    </div>
                    {
                        user.role === "user" && <div
                            onClick={() => { router.push('/profile') }}
                        >
                            <FaCartShopping className="text-3xl font-semibold" />
                        </div>
                    }

                </div>
            )}
        </div>
    );
};

export default Navbar;

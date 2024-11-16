import Image from 'next/image'
import React from 'react'
import { FaPowerOff } from "react-icons/fa";
import Link from 'next/link';

type Props = {}

const Navbar = (props: Props) => {
    return (
        <div className='fixed top-0 left-0 z-50 w-full py-2 bg-gradient-to-r from-purple-200 to-purple-300 border-b-4 border-purple-800 flex justify-around items-center shadow-xl'>
            <div className='flex items-center gap-4'>
                <Link href="/" className='flex cursor-pointer items-center gap-4 px-4 bg-white shadow-lg hover:shadow-xl opacity-90 rounded-xl p-2'>
                    <Image
                        src="/logo1.png"
                        alt='logo'
                        width={48}
                        height={48}

                    />
                    <span className='font-semibold text-4xl font-serif'>VTO</span>
                </Link>
                {/* <div className='flex gap-4 text-purple-600 font-semibold text-lg '>
                    <Link href="/pages/about"className='transition-opacity hover:scale-105 duration-300 cursor-pointer hover:underline'>
                        About
                    </Link>
                    <Link href="/pages/contact" className='transition-opacity hover:scale-105 duration-300 cursor-pointer hover:underline'>
                        Contact
                    </Link>
                </div> */}
            </div>
            <div>
                <Link href="/pages/login" className='p-3 bg-purple-500 shadow-lg hover:shadow-xl hover:bg-purple-600 flex cursor-pointer items-center gap-2 rounded-xl px-6 text-white font-sans font-semibold '>
                    <FaPowerOff /> Login
                </Link>
            </div>
        </div>
    )
}

export default Navbar
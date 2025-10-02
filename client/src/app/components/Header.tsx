"use client";
import Link from "next/link";
import logo from "../../../public/images/northman-logo.webp";
import Image from "next/image";

export default function Header() { 
  return (
    <header className="bg-[#1E2E45] py-[30px]">
      <nav className="container flex justify-between items-center">
        <Link href="">
          <Image src={logo} alt="logo" />
        </Link>
        <div className="flex gap-x-4">
          <Link 
            href="/our-services"
            className="px-4 py-1 text-white font-medium "
            style={{ borderColor: '#D92C54' }}
          >
            Our Services
          </Link>

           <Link 
            href="/about-us"
            className="px-4 py-1 text-white font-medium "
            style={{ borderColor: '#D92C54' }}
          >
            About Us
          </Link>
          <Link 
            href="/auth/login"
            className="px-4 py-1 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md text-sm"
          >
            Login
          </Link>
          <Link 
            href="/auth/signup"
            className="px-4 py-1 text-white font-medium rounded-md border-2 border-[#D92C54] bg-[#D92C54] hover:bg-[#B8233E] transition-colors duration-200 shadow-sm hover:shadow-md text-sm"
            style={{ borderColor: '#D92C54' }}
          >
            Register
          </Link>
         
        </div>
      </nav>
    </header>
  );
}
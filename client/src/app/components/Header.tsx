"use client";
import Link from "next/link";
import logo from "../../../public/images/northman-logo.webp";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="bg-[#1E2E45] py-[20px] sm:py-[24px]">
      <nav className="container flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src={logo} alt="logo" className="h-auto w-[140px] sm:w-[160px]" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-x-4">
          <Link
            href="/our-services"
            className="px-4 py-2 text-white font-medium hover:text-gray-200 transition-colors"
          >
            Our Services
          </Link>
          <Link
            href="/about-us"
            className="px-4 py-2 text-white font-medium hover:text-gray-200 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/auth/login"
            className="px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors duration-200 shadow-sm hover:shadow-md text-sm"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="px-4 py-2 text-white font-medium rounded-md border-2 border-[#D92C54] bg-[#D92C54] hover:bg-[#B8233E] transition-colors duration-200 shadow-sm hover:shadow-md text-sm"
          >
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          aria-label="Toggle menu"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => setMobileOpen((s) => !s)}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      
      {/* Mobile menu panel with smooth transition */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-700 ease-in-out border-t border-white/10 ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="container py-3 flex flex-col gap-2">
          <Link
            href="/our-services"
            className="px-3 py-2 text-white rounded hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            Our Services
          </Link>
          <Link
            href="/about-us"
            className="px-3 py-2 text-white rounded hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
          >
            About Us
          </Link>
          <div className="flex items-center gap-2 pt-2">
            <Link
              href="/auth/login"
              className="flex-1 px-4 py-2 bg-green-500 text-center text-white font-medium rounded-md hover:bg-green-600 transition-colors text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="flex-1 px-4 py-2 text-white text-center font-medium rounded-md border-2 border-[#D92C54] bg-[#D92C54] hover:bg-[#B8233E] transition-colors text-sm"
              onClick={() => setMobileOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      </div>

    </header>
  );
}
"use client";
import Link from "next/link";
import logo from "../../../public/images/northman-logo.webp";
import Image from "next/image";
import { logoutUser } from "../service/authAPI";
import {toast} from 'react-toastify'
import { removeUser } from "../store/userSlice";
import { useAppDispatch } from "../store/hooks";
export default function Header() {

    const dispatch = useAppDispatch();
    const handleLogout = async()=>{
        const response= await logoutUser();
        dispatch(removeUser(response.data))
        toast.success("Logged out successfully");
    }
  return (
    <>
      <header className="container">
        <nav className="pt-[41px] pb-[52px] flex justify-between items-center">
          <Link href="/">
            <Image src={logo} alt="logo" />
          </Link>

          <ol className="flex gap-x-[30px] items-center text-white ">
            <li>
              <Link
                className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                href=""
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                href=""
              >
                About
              </Link>
            </li>
            <li>
              <Link
                className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                href=""
              >
                Services
              </Link>
            </li>
            
            <li>
              <Link
              onClick={handleLogout}
                className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                href="/auth/login"
              >
                Logout
              </Link>
            </li>
          </ol>
        </nav>
      </header>
    </>
  );
}

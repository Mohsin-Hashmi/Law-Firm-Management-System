"use client";
import Link from "next/link";
import logo from "../../../public/images/northman-logo.webp";
import Image from "next/image";
import { logoutUser } from "../service/authAPI";
import { toast } from "react-toastify";
import { removeUser } from "../store/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const role = useAppSelector((state) => state.user.user?.role);
  // logout handler
  const handleLogout = async () => {
    const response = await logoutUser();
    dispatch(removeUser(response.data));
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };
  const navLinksMap: Record<string, { label: string; href: string }[]> = {
    "Super Admin": [
      { label: "Home", href: "/" },
      { label: "About", href: "/pages/about-us" },
      { label: "Services", href: "/" },
      { label: "Firms", href: "/pages/super-admin/get-firms" },
      { label: "Add Firm", href: "/pages/super-admin/add-firm" },
    ],
    "Firm Admin": [
      { label: "Home", href: "/" },
      { label: "About", href: "/pages/about-us" },
      { label: "Services", href: "/" },
      { label: "Lawyers", href: "/" },
      { label: "Clients", href: "/" },
      { label: "Add Lawyer", href: "/" },
    ],
    "Lawyer": [
      { label: "Home", href: "/" },
      { label: "About", href: "/pages/about-us" },
      { label: "Services", href: "/" },
      { label: "My Clients", href: "/" },
      { label: "Add Client", href: "/" },
    ],
  };

  return (
    <header className="bg-[#1E2E45] py-[30px]">
      <nav className=" container flex justify-between items-center">
        <Link href="/">
          <Image src={logo} alt="logo" />
        </Link>

        <ol className="flex gap-x-[30px] items-center text-white">
          {navLinksMap[role || "Lawyer"]?.map((link) => (
            <li key={link.label}>
              <Link
                className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}

          <li>
            <button
              onClick={handleLogout}
              className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
            >
              Logout
            </button>
          </li>
        </ol>
      </nav>
    </header>
  );
}
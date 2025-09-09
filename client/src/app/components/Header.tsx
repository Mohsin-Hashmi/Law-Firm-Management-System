"use client";
import Link from "next/link";
import logo from "../../../public/images/northman-logo.webp";
import Image from "next/image";
import { logoutUser } from "../service/authAPI";
import { toast } from "react-toastify";
import { removeUser } from "../store/userSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname= usePathname();
  const role = useAppSelector((state) => state.user.user?.role);
  // logout handler
  const handleLogout = async () => {
    const response = await logoutUser();
    dispatch(removeUser(response.data));
    router.push("/auth/login");
    toast.success("Logged out successfully");
  };

   

  const isLandingPage = pathname === "/landing-page";
  
   const logoHref = 
    isLandingPage ? "/landing-page" : 
     role ? "/" : 
    "/";

   // Landing page navigation links
  const landingPageLinks = [
    { label: "About Us", href: "/about-us" },
    { label: "Services", href: "/our-services" },
    { label: "Login", href: "/auth/login" },
    { label: "Register", href: "/auth/signup" },
  ];
  const navLinksMap: Record<string, { label: string; href: string }[]> = {
    "Super Admin": [
      { label: "Home", href: "/" },
      { label: "Firms", href: "/super-admin/get-firms" },
      { label: "Add Firm", href: "/super-admin/add-firm" },
    ],
    "Firm Admin": [
      { label: "Home", href: "/" },
      { label: "Lawyers", href: "/lawyers" },
      { label: "Clients", href: "/clients" },
      { label: "Add Lawyer", href: "/lawyers/add" },
    ],
    "Lawyer": [
      { label: "Home", href: "/" },
      { label: "My Clients", href: "/clients" },
      { label: "Add Client", href: "/clients/add" },
    ],
  };

  return (
    <header className="bg-[#1E2E45] py-[30px]">
      <nav className=" container flex justify-between items-center">
        <Link href={logoHref}>
          <Image src={logo} alt="logo" />
        </Link>

        <ol className="flex gap-x-[30px] items-center text-white">
          {isLandingPage ? (
            // Landing page navigation
            <>
              {landingPageLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </>
          ) : role ? (
            // Authenticated user navigation
            <>
              {navLinksMap[role]?.map((link) => (
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
            </>
          ) : (
            // Fallback for unauthenticated non-landing pages
            landingPageLinks.map((link) => (
              <li key={link.label}>
                <Link
                  className="hover:text-gray-300 hover:underline [text-underline-offset:4px]"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))
          )}
        </ol>
      </nav>
    </header>
  );
}
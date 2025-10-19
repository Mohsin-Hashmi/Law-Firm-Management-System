"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      console.log("🔍 Checking auth for pathname:", pathname);
      
      // Public routes that don't need authentication
      const publicRoutes = [
        '/auth/login', 
        '/auth/signup', 
        '/auth/forgot-password', 
        '/',
        '/about',
        '/services',
        '/our-services',
        '/contact'
      ];
      
      // Check if current route is public
      const isPublicRoute = publicRoutes.some(route => 
        pathname === route || pathname.startsWith(route + '/')
      );
      
      console.log("🔍 Is public route?", isPublicRoute);
      
      if (isPublicRoute) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check for token
      const localToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      const token = localToken || cookieToken;
      
      console.log("🔍 Token exists?", !!token);
      
      if (!token) {
        console.log("🚫 No token found, redirecting to login");
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}&message=Please login to continue`);
        return;
      }

      // If token exists, allow access
      // Role-based restrictions should be handled by your backend API
      console.log("✅ Token found, allowing access");
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9A9162] mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
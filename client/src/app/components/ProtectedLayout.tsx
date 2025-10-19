"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      // Public routes that don't need authentication
      const publicRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/'];
      
      // Check if current route is public
      const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
      
      if (isPublicRoute) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check for token in localStorage or cookies
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        console.log("🚫 No token found, redirecting to login");
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Check role-based access
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const role = user.role;

          // Define role-based route access
          const roleRoutes: Record<string, string[]> = {
            'Super Admin': ['/super-admin', '/dashboard'],
            'Firm Admin': ['/firm-admin', '/dashboard'],
            'Lawyer': ['/lawyer', '/dashboard'],
            'Assistant': ['/assistant', '/dashboard'],
          };

          // Check if user has access to current route
          if (role && roleRoutes[role]) {
            const hasAccess = roleRoutes[role].some(route => pathname.startsWith(route));
            
            if (!hasAccess) {
              console.log("🚫 User doesn't have access to this route");
              router.push('/unauthorized');
              return;
            }
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }

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

  // Don't render protected content until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
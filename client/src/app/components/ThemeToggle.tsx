"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <SunOutlined className="text-yellow-400 text-lg" />
      ) : (
        <MoonOutlined className="text-slate-600 text-lg" />
      )}
    </button>
  );
}

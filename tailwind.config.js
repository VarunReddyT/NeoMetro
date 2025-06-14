/** @type {import('tailwindcss').Config} */

export const content = ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"];
export const theme = {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#3b82f6",
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
      },
      metro: {
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9",
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c4a6e",
      },
      secondary: {
        DEFAULT: "#6b7280",
        foreground: "#f9fafb",
      },
      destructive: {
        DEFAULT: "#ef4444",
        foreground: "#fef2f2",
      },
      muted: {
        DEFAULT: "#f3f4f6",
        foreground: "#6b7280",
      },
      accent: {
        DEFAULT: "#f3f4f6",
        foreground: "#1f2937",
      },
      popover: {
        DEFAULT: "#ffffff",
        foreground: "#1f2937",
      },
      card: {
        DEFAULT: "#ffffff",
        foreground: "#1f2937",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    animation: {
      "fade-in": "fadeIn 0.5s ease-in-out",
      "slide-up": "slideUp 0.3s ease-out",
      "pulse-slow": "pulse 3s infinite",
    },
    keyframes: {
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      slideUp: {
        "0%": { transform: "translateY(10px)", opacity: "0" },
        "100%": { transform: "translateY(0)", opacity: "1" },
      },
    },
    borderRadius: {
      lg: "0.5rem",
      md: "0.375rem",
      sm: "0.25rem",
    },
  },
};

import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./frontend/index.html", "./frontend/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem", /* 9px */
        md: ".375rem", /* 6px */
        sm: ".1875rem", /* 3px */
      },
      colors: {
        // Flat / base colors (regular buttons)
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
          border: "hsl(var(--card-border) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
          border: "hsl(var(--popover-border) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          border: "var(--primary-border)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
          border: "var(--secondary-border)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
          border: "var(--muted-border)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
          border: "var(--accent-border)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          border: "var(--destructive-border)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
        chart: {
          "1": "hsl(var(--chart-1) / <alpha-value>)",
          "2": "hsl(var(--chart-2) / <alpha-value>)",
          "3": "hsl(var(--chart-3) / <alpha-value>)",
          "4": "hsl(var(--chart-4) / <alpha-value>)",
          "5": "hsl(var(--chart-5) / <alpha-value>)",
        },
        sidebar: {
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        "sidebar-primary": {
          DEFAULT: "hsl(var(--sidebar-primary) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          border: "var(--sidebar-primary-border)",
        },
        "sidebar-accent": {
          DEFAULT: "hsl(var(--sidebar-accent) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "var(--sidebar-accent-border)"
        },
        status: {
          online: "rgb(34 197 94)",
          away: "rgb(245 158 11)",
          busy: "rgb(239 68 68)",
          offline: "rgb(156 163 175)",
        },
        // Stitch Royal Heritage Design Tokens (Light Design 1 & Dark Design 3)
        maroon: {
          DEFAULT: '#5E0F2B',
          dark: '#45091E',
          deep: '#360617',
          light: '#7A183B',
          surface: '#5E0F2B12',
        },
        gold: {
          DEFAULT: '#C59B27',
          light: '#E2BD5A',
          muted: '#B0881F',
          tint: '#FBF5E5',
        },
        parchment: {
          50: '#FDFBF7',
          100: '#F9F5EC',
          200: '#F3ECE0',
          300: '#E8DEC9',
          DEFAULT: '#F7F3E9',
        },
        dusk: {
          950: '#0D070B',
          900: '#140A10',
          850: '#1A0F16',
          800: '#21141C',
          700: '#2E1B27',
        },
        stitch: {
          primary: "#6c0029",
          "primary-container": "#8b1e3f",
          "on-primary": "#ffffff",
          "on-primary-container": "#ff9db0",
          secondary: "#7d562d",
          "secondary-container": "#ffca98",
          "secondary-fixed": "#ffdcbd",
          "on-secondary": "#ffffff",
          "on-secondary-container": "#7a532a",
          "on-secondary-fixed": "#2c1600",
          tertiary: "#0a3b22",
          "tertiary-container": "#255238",
          "tertiary-fixed": "#bceecb",
          "on-tertiary": "#ffffff",
          "on-tertiary-container": "#94c4a2",
          "on-tertiary-fixed": "#002110",
          surface: "#faf8ff",
          "surface-container-lowest": "#ffffff",
          "surface-container-low": "#f2f3ff",
          "surface-container": "#eaedff",
          "surface-container-high": "#e2e7ff",
          "surface-container-highest": "#dae2ff",
          "on-surface": "#131b30",
          "on-surface-variant": "#564145",
          outline: "#897174",
          "outline-variant": "#ddbfc3",
          "inverse-surface": "#283046",
          "inverse-on-surface": "#eef0ff",
        },
      },
      boxShadow: {
        'royal': '0 8px 30px -4px rgba(94, 15, 43, 0.08), 0 2px 10px -2px rgba(197, 155, 39, 0.06)',
        'royal-glow': '0 8px 32px -4px rgba(243, 194, 70, 0.15), 0 2px 14px -2px rgba(136, 19, 55, 0.4)',
        'card-lift': '0 12px 28px -6px rgba(45, 10, 20, 0.12)',
        'gold-glow': '0 0 20px rgba(243, 194, 70, 0.25)',
        'palace-incandescent': '0 0 35px -2px rgba(255, 198, 55, 0.45), inset 0 0 20px 0 rgba(255, 215, 0, 0.25)',
      },
      fontFamily: {
        royal: ["Cinzel", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
        display: ["Playfair Display", "Lora", "serif"],
        mono: ["var(--font-mono)"],
        "playfair": ["Playfair Display", "serif"],
        "jakarta": ["Plus Jakarta Sans", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

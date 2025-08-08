import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for lovable.dev theme
        "primary-glow": "hsl(var(--primary-glow))",
        "accent-blue": "hsl(var(--accent-blue))",
        "glass-border": "hsl(var(--glass-border))",
        "gradient-hero-start": "hsl(var(--gradient-hero-start))",
        "gradient-hero-end": "hsl(var(--gradient-hero-end))",
        "gradient-content-start": "hsl(var(--gradient-content-start))",
        "gradient-content-end": "hsl(var(--gradient-content-end))",
        emerald: {
          100: "hsl(150 100% 95%)",
          200: "hsl(150 100% 90%)",
          300: "hsl(150 100% 80%)",
          700: "hsl(150 100% 30%)",
        },
        rose: {
          100: "hsl(350 100% 95%)",
          200: "hsl(350 100% 90%)",
          300: "hsl(350 100% 80%)",
          700: "hsl(350 100% 30%)",
        },
        blue: {
          100: "hsl(210 100% 95%)",
          200: "hsl(210 100% 90%)",
          300: "hsl(210 100% 80%)",
          700: "hsl(210 100% 30%)",
        },
        purple: {
          100: "hsl(270 100% 95%)",
          200: "hsl(270 100% 90%)",
          300: "hsl(270 100% 80%)",
          700: "hsl(270 100% 30%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

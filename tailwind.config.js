/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#121212",
        "surface-hover": "#1a1a1a",
        primary: "#3b82f6", // Blue accent
        secondary: "#a855f7", // Purple accent
        text: "#ededed",
        "text-muted": "#a1a1aa",
        border: "#27272a",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
      },
      animation: {
        scroll: 'scroll 20s linear infinite',
        'scroll-right': 'scroll-right 20s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

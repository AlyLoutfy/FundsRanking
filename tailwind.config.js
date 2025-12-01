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
        sans: ['Space Grotesk', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
        inter: ['Inter', 'sans-serif'],
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        sleekOpen: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        sleekClose: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
        },
        drawerOpen: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        drawerClose: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        scroll: 'scroll 20s linear infinite',
        'scroll-right': 'scroll-right 20s linear infinite',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        fadeOut: 'fadeOut 0.2s ease-in forwards',
        zoomIn: 'zoomIn 0.2s ease-out forwards',
        zoomOut: 'zoomOut 0.2s ease-in forwards',
        sleekOpen: 'sleekOpen 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        sleekClose: 'sleekClose 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        drawerOpen: 'drawerOpen 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        drawerClose: 'drawerClose 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}

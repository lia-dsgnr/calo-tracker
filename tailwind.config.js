/** @type {import('tailwindcss').Config} */
export default {
  // Enable dark mode via class strategy (not used in MVP but ready for future)
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Design system colors: soft, wellness-inspired, non-judgmental palette
      colors: {
        // Primary: Sage/olive green for CTAs and positive states
        primary: {
          DEFAULT: "#7C9A6E",
          light: "#9BB58D",
          dark: "#5E7A52",
          foreground: "#FFFFFF",
        },
        // Secondary: Warm coral/orange for highlights
        secondary: {
          DEFAULT: "#E8846C",
          light: "#F0A08A",
          dark: "#D46A52",
          foreground: "#FFFFFF",
        },
        // Tertiary: Soft lavender for supporting elements
        tertiary: {
          DEFAULT: "#9B8BD4",
          light: "#B5A8E0",
          dark: "#7E6CC0",
        },
        // Background: Warm cream base
        background: {
          DEFAULT: "#FAF8F5",
          card: "#FFFFFF",
        },
        // Text colors
        foreground: {
          DEFAULT: "#3D3530",
          muted: "#8A8279",
        },
        // Semantic colors (avoid red for non-errors)
        success: "#7C9A6E",
        warning: "#E8846C",
        error: "#C94A4A",
        // Ring/border
        ring: "#7C9A6E",
        border: "#E8E4DE",
      },
      // Border radius following design system
      borderRadius: {
        'card': '20px',
        'pill': '9999px',
        'sheet': '24px',
      },
      // Shadows: soft, diffused
      boxShadow: {
        'card': '0 2px 8px rgba(61, 53, 48, 0.06)',
        'sheet': '0 -4px 20px rgba(61, 53, 48, 0.1)',
        'tile': '0 1px 4px rgba(61, 53, 48, 0.08)',
      },
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'headline': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body': ['0.875rem', { lineHeight: '1.375rem', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
      },
      // Animation for progress ring
      animation: {
        'ring-fill': 'ringFill 700ms ease-out forwards',
        'slide-up': 'slideUp 300ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
      },
      keyframes: {
        ringFill: {
          '0%': { strokeDashoffset: '251.2' },
          '100%': { strokeDashoffset: 'var(--ring-offset)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

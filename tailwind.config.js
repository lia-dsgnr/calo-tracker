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
      // Design system colors: warm, wellness-inspired palette
      colors: {
        // === LAYER 1: Pure Color Scales ===

        // Mindful Brown - primary neutrals, titles, icons, borders
        brown: {
          10: '#F7F4F2',
          20: '#EBDDD9',
          30: '#D6C2B8',
          40: '#C0A091',
          50: '#AC836C',
          60: '#926247',
          70: '#704A33',
          80: '#4F3422',
          90: '#372315',
          100: '#372315',
        },

        // Optimistic Gray - backgrounds, dividers, disabled states
        gray: {
          10: '#F5F5F5',
          20: '#E1E1E0',
          30: '#C9C7C5',
          40: '#ACA9A5',
          50: '#8A8680', // Interpolated value (original #9B2B86 was typo)
          60: '#736B66',
          70: '#5A545E',
          80: '#3F3C36',
          90: '#292723',
          100: '#161513',
        },

        // Serenity Green - success, healthy range, add-actions
        green: {
          10: '#F2F5EB',
          20: '#E5EAD7',
          30: '#CFD9B5',
          40: '#B4C48D',
          50: '#9BB068',
          60: '#7D944D',
          70: '#5A6B38',
          80: '#3D4A26',
          90: '#29321A',
          100: '#191E10',
        },

        // Empathy Orange - warnings, calorie highs, charts, CTAs
        orange: {
          10: '#FFEEE2',
          20: '#FFC89E',
          30: '#F6A360',
          40: '#ED7E1C',
          50: '#C96100',
          60: '#AA5500',
          70: '#894700',
          80: '#663600',
          90: '#432500',
          100: '#2E1200',
        },

        // Zen Yellow - highlights, badges, subtle attention cues
        yellow: {
          10: '#FFF4E0',
          20: '#FFF0E0',
          30: '#FFE0C2',
          40: '#FFF0C5',
          50: '#FFBD1A',
          60: '#E0A500',
          70: '#A37A00',
          80: '#705600',
          90: '#4D3C00',
          100: '#2E2500',
        },

        // Kind Purple - optional accent (weekly insights, achievements)
        purple: {
          10: '#F6F1FF',
          20: '#DDD1FF',
          30: '#C2B1FF',
          40: '#A694F5',
          50: '#8978E3',
          60: '#6C5FC8',
          70: '#5349A5',
          80: '#3C357C',
          90: '#292350',
          100: '#161324',
        },

        // === LAYER 2: Semantic Tokens ===

        // Primary: Serenity Green for CTAs, success states
        primary: {
          DEFAULT: '#7D944D', // green-60
          light: '#9BB068',   // green-50
          dark: '#5A6B38',    // green-70
          foreground: '#FFFFFF',
        },

        // Secondary: Empathy Orange for highlights, warnings
        secondary: {
          DEFAULT: '#AA5500', // orange-60
          light: '#ED7E1C',   // orange-40
          dark: '#894700',    // orange-70
          foreground: '#FFFFFF',
        },

        // Tertiary: Kind Purple for accents
        tertiary: {
          DEFAULT: '#6C5FC8', // purple-60
          light: '#8978E3',   // purple-50
          dark: '#5349A5',    // purple-70
        },

        // Background: Optimistic Gray base
        background: {
          DEFAULT: '#F5F5F5', // gray-10
          card: '#FFFFFF',
        },

        // Text (foreground): Mindful Brown
        foreground: {
          DEFAULT: '#372315', // brown-90
          muted: '#736B66',   // gray-60
        },

        // Semantic states
        success: '#7D944D',   // green-60
        warning: '#AA5500',   // orange-60
        error: '#894700',     // orange-70 (warm, non-aggressive)

        // Border and ring
        border: '#E1E1E0',    // gray-20
        ring: '#7D944D',      // green-60
      },

      // Border radius following design system
      borderRadius: {
        'card': '20px',
        'pill': '9999px',
        'sheet': '24px',
        'chip': '12px',
        'input': '16px',
      },

      // Shadows: very soft, 0-4px blur, low opacity
      boxShadow: {
        'card': '0 2px 4px rgba(55, 35, 21, 0.04)',
        'sheet': '0 -2px 8px rgba(55, 35, 21, 0.06)',
        'tile': '0 1px 3px rgba(55, 35, 21, 0.05)',
      },

      // Typography: Nunito Sans font
      fontFamily: {
        sans: ['Nunito Sans', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // New design system scale - optimized for mobile readability
        'h1': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],         // 32px
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],         // 24px
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],     // 20px
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }], // 18px
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],       // 16px
        'caption': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }], // 14px
        'numeric-lg': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '600' }], // 28px
        'numeric': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px

        // Legacy aliases for backward compatibility
        'headline': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],   // 32px
        'title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // 20px
      },

      // Animation for progress ring and transitions
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

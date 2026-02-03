/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#050507',
        'dark-surface': '#0a0a0f',
        'dark-border': '#1a1a2e',
        'dark-hover': '#16162a',
        'primary': '#EE4D2D',
        'primary-hover': '#ff6b47',
        'primary-glow': 'rgba(238, 77, 45, 0.4)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'aurora': 'aurora 15s ease infinite',
        'tilt': 'tilt 10s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(238, 77, 45, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(238, 77, 45, 0.6)' },
        },
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
      },
      backgroundImage: {
        'aurora-gradient': 'radial-gradient(ellipse at 20% 50%, rgba(238, 77, 45, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
      },
      backdropBlur: {
        'xl': '24px',
      },
    },
  },
  plugins: [],
}

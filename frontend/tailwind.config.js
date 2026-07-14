/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "inverse-surface": "#303030",
        "on-primary-container": "#99baa9",
        "primary-fixed": "#c8ead8",
        "surface-container-low": "#f5f3f3",
        "on-error-container": "#93000a",
        "on-surface-variant": "#424844",
        "surface-dim": "#dbd9d9",
        "surface-variant": "#e4e2e2",
        "on-tertiary-container": "#b0b4ae",
        "on-tertiary-fixed": "#191d19",
        "secondary": "#4c6548",
        "on-secondary-fixed-variant": "#354d31",
        "surface-container-high": "#eae8e7",
        "surface-bright": "#fbf9f8",
        "secondary-container": "#ceeac5",
        "on-surface": "#1b1c1c",
        "on-primary": "#ffffff",
        "primary-fixed-dim": "#adcebd",
        "surface-container-lowest": "#ffffff",
        "surface-tint": "#466557",
        "on-error": "#ffffff",
        "primary": "#163428",
        "error-container": "#ffdad6",
        "tertiary-fixed-dim": "#c4c7c2",
        "tertiary-fixed": "#e0e3de",
        "secondary-fixed-dim": "#b3ceab",
        "tertiary": "#2c302c",
        "error": "#ba1a1a",
        "tertiary-container": "#424642",
        "surface": "#fbf9f8",
        "primary-container": "#2d4b3e",
        "on-primary-fixed-variant": "#2f4d40",
        "on-tertiary-fixed-variant": "#444844",
        "on-secondary": "#ffffff",
        "on-primary-fixed": "#012116",
        "surface-container-highest": "#e4e2e2",
        "surface-container": "#efeded",
        "outline-variant": "#c1c8c3",
        "outline": "#727974",
        "secondary-fixed": "#ceeac5",
        "on-secondary-container": "#526b4d",
        "on-secondary-fixed": "#0a2009",
        "on-tertiary": "#ffffff",
        "on-background": "#1b1c1c",
        "inverse-primary": "#adcebd",
        "background": "#fbf9f8",
        "inverse-on-surface": "#f2f0f0"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "margin-desktop": "64px",
        "container-max": "1280px",
        "unit": "8px",
        "margin-mobile": "20px",
        "gutter": "24px"
      },
      fontFamily: {
        "label-sm": ["Hanken Grotesk"],
        "headline-lg-mobile": ["Manrope"],
        "headline-lg": ["Manrope"],
        "headline-xl": ["Manrope"],
        "body-md": ["Manrope"]
      },
      fontSize: {
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [],
}

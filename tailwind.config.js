/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                'times-new-roman': ['Times New Roman', 'Times', 'serif'],
                inter: ['Inter'],
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                grizzly: {
                    "primary": "#00704a",
                    "secondary": "#3c9635",
                    "accent": "#4af50c",
                    "neutral": "#00704a",
                    "base-100": "#f4f4f3",
                    "info": "#0b7dbc",
                    "success": "#00ff00",
                    "warning": "orange",
                    "error": "#ff0000",
                },
              }
        ]
    }
};

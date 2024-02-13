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
    plugins: [],
};

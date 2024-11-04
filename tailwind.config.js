/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.vue",
    ],
    safelist: [
        "popup",
        "popup-shown",
        "popup-hidden",
        "overlay-press",
        "overlay-hover",
        "fadeon",
        "fadeoff",
    ],
    theme: {
    },
    plugins: [],
};

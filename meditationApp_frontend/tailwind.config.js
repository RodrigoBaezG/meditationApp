// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        // Asegúrate de incluir todos los archivos donde usas clases de Tailwind
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // ✨ Sobrescribe la pila de fuentes 'sans' (la fuente por defecto de Tailwind)
            fontFamily: {
                sans: ['Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
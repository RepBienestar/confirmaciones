/** @type {import('tailwindcss').Config} */
/* global module, require */
module.exports = {
    plugins: [
        require('flowbite/plugin')
    ],
    content : [
        './src/**/*.{html,ts}',
        './node_modules/flowbite/**/*.js'
    ],
    theme   : {
        extend : {
            fontFamily : {
                sans  : [ 'Inter', 'sans-serif' ],
                serif : [ 'Merriweather', 'serif' ]
            },
            colors     : {
                'azul-bienestar'  : {
                    '50'  : '#f0f8fe',
                    '100' : '#dceefd',
                    '200' : '#c1e2fc',
                    '300' : '#97d0f9',
                    '400' : '#66b6f4',
                    '500' : '#4298ef',
                    '600' : '#2c7be4',
                    '700' : '#2465d1',
                    '800' : '#2352aa',
                    '900' : '#224786',
                    '950' : '#1e3561'//default
                },
                'verde-bienestar' : {
                    '50'  : '#eefff5',
                    '100' : '#d6ffe9',
                    '200' : '#b0ffd5',
                    '300' : '#72ffb5',
                    '400' : '#2efa8e',
                    '500' : '#04e36d',
                    '600' : '#00bd56',
                    '700' : '#019447',//default
                    '800' : '#07743b',
                    '900' : '#085f34',
                    '950' : '#00361b'
                },
                'negro-bienestar': {
                    '50'  : '#f9f9f9', // Muy claro
                    '100' : '#f2f2f2', // Claro
                    '200' : '#d9d9d9', // Más claro
                    '300' : '#bfbfbf', // Gris medio
                    '400' : '#808080', // Gris oscuro
                    '500' : '#4d4d4d', // Gris profundo
                    '600' : '#333333', // Negro tenue
                    '700' : '#1a1a1a', // Negro predeterminado
                    '800' : '#0d0d0d', // Negro más oscuro
                    '900' : '#050505', // Negro casi puro
                    '950' : '#000000'  // Negro puro
                },
                'gris-bienestar': {
                    '50'  : '#f9f9f9',  // Gris muy claro
                    '100' : '#f2f2f2',  // Gris claro
                    '200' : '#e6e6e6',  // Gris tenue
                    '300' : '#cccccc',  // Gris suave
                    '400' : '#b3b3b3',  // Gris medio-claro
                    '500' : '#999999',  // Gris medio
                    '600' : '#808080',  // Gris estándar
                    '700' : '#666666',  // Gris medio-oscuro
                    '800' : '#4d4d4d',  // Gris oscuro
                    '900' : '#333333',  // Gris muy oscuro
                    '950' : '#1a1a1a'   // Gris casi negro
                }
            }
        }
    },
    plugins : [
        require ( 'flowbite/plugin' )
    ]
};

import { Component } from '@angular/core';
@Component({
  selector: 'app-sin-datos',
  template: `
    <div class="p-6 mb-6 mt-8 text-center text-sm text-gray-800 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-200"
        role="alert">
        <div class="flex flex-col items-center justify-center space-y-4">
            <!-- Icono -->
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                class="text-blue-600 dark:text-blue-400">
                <path fill="currentColor"
                    d="M20 13.09V7c0-2.21-3.58-4-8-4S4 4.79 4 7v10c0 2.21 3.59 4 8 4c.46 0 .9 0 1.33-.06A6 6 0 0 1 13 19v-.05c-.32.05-.65.05-1 .05c-3.87 0-6-1.5-6-2v-2.23c1.61.78 3.72 1.23 6 1.23c.65 0 1.27-.04 1.88-.11A5.99 5.99 0 0 1 19 13c.34 0 .67.04 1 .09m-2-.64c-1.3.95-3.58 1.55-6 1.55s-4.7-.6-6-1.55V9.64c1.47.83 3.61 1.36 6 1.36s4.53-.53 6-1.36zM12 9C8.13 9 6 7.5 6 7s2.13-2 6-2s6 1.5 6 2s-2.13 2-6 2m10 9v2h-4v2l-3-3l3-3v2z" />
            </svg>

            <!-- Mensaje principal -->
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                No se encontraron registros
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
                Parece que no hay resultados disponibles en este momento.
            </p>
        </div>
    </div>
  `,
})
export class SinDatosComponent {

}

import { Component } from '@angular/core';

@Component({
  selector: 'app-comp-not-found',
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
        <h1 class="text-9xl font-bold text-blue-600">404</h1>
        <h2 class="text-2xl font-semibold mt-4">Página No Encontrada</h2>
        <p class="mt-2 text-gray-500">Lo sentimos, la página que buscas no existe.</p>
        <a routerLink="/inicio" class="mt-6 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all">
            Volver al Inicio
        </a>
    </div>

  `,
})
export class CompNotFoundComponent { }

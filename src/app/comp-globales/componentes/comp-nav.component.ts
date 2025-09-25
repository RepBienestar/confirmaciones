import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-comp-Nav',
  template: `
    <nav class="bg-azul-bienestar-950 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <div class="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-16">
            
            <a href="/" class="flex items-center">
                <img src="assets/imagenes/LOGO_BLANCO.png" class="h-10" alt="Logo del Bienestar" />
            </a>

            <button type="button"
                    (click)="isNavOpen = !isNavOpen"
                    class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-white rounded-lg md:hidden
                        hover:bg-verde-bienestar-700 focus:outline-none focus:ring-2 focus:ring-gray-200">
            <span class="sr-only">Abrir menú</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <!-- Menú (oculto en móvil por defecto) -->
            <div class="hidden md:flex items-center space-x-6"  id="navbar-dropdown">
            
            <!-- Menú dinámico -->
                <ul class="flex flex-col md:flex-row md:items-center md:space-x-6 font-medium">
                    <li *ngFor="let menu of modulos; let i = index"
                        class="text-white rounded-md relative"
                        [ngClass]="{
                        'bg-azul-bienestar-950': selectedIndex !== i,
                        'bg-verde-bienestar-700': selectedIndex === i
                        }"
                        (click)="selectMenu(i, menu); isNavOpen = false">

                        <!-- Dropdown o link simple -->
                        <ng-container *ngIf="menu.subModulos?.length > 0; else menuNormal">
                            <ng-template [ngTemplateOutlet]="drop"
                                        [ngTemplateOutletContext]="{ $implicit: menu, ixMenu: i }">
                            </ng-template>
                        </ng-container>

                        <ng-template #menuNormal>
                            <a [routerLink]="menu.rutaModulo"
                                class="block py-2 px-3 hover:bg-verde-bienestar-900 rounded-md">
                                <i [class]="menu.icono"></i>
                                {{ menu.etiqueta }}
                            </a>
                        </ng-template>
                    </li>
                </ul>

                <!-- Logout (oculto en móvil) -->
                <ng-template [ngTemplateOutlet]="bootonClose" [ngTemplateOutletContext]="{ $implicit: '' }"></ng-template>
                
            </div>
        </div>

        <!-- Menú móvil (se muestra debajo del nav cuando se abre) -->
        <div *ngIf="isNavOpen" class="md:hidden px-4 pb-4 space-y-2">
            <ul class="flex flex-col font-medium">
                <li *ngFor="let menu of modulos; let i = index"
                    [ngClass]="{
                    'bg-azul-bienestar-950': selectedIndex !== i,
                    'bg-verde-bienestar-700': selectedIndex === i
                    }"
                    (click)="selectMenu(i, menu); isNavOpen = false"
                    class="text-white rounded-md">

                <!-- Menú con dropdown -->
                <ng-container *ngIf="menu.subModulos?.length > 0; else menuNormalMobile">
                    <ng-template [ngTemplateOutlet]="drop"
                                [ngTemplateOutletContext]="{ $implicit: menu, ixMenu: i }">
                    </ng-template>
                </ng-container>

                <!-- Menú simple -->
                <ng-template #menuNormalMobile>
                    <a [routerLink]="menu.rutaModulo"
                    class="block py-2 px-3 hover:bg-verde-bienestar-900 rounded-md">
                    <i [class]="menu.icono"></i>
                    {{ menu.etiqueta }}
                    </a>
                </ng-template>
                </li>
            </ul>

            <!-- Botón Cerrar sesión (solo móvil) -->
            <ng-template [ngTemplateOutlet]="bootonClose" [ngTemplateOutletContext]="{ $implicit: 'Cerrar sesión' }"></ng-template>

        </div>
    </nav>

    <ng-template #bootonClose let-textoDato>
        <a href="/"
            class="flex items-center justify-center bg-white text-gray-900 border border-gray-300
                    px-4 py-2 rounded-lg shadow-md hover:bg-gray-200">
                <i class="fa-solid fa-right-from-bracket text-xl mr-2"></i>
                {{textoDato}}
        </a>
    </ng-template>
    

    <!-- Dropdown template (sin cambios) -->
    <ng-template #drop let-datoMenu let-ixMenu="ixMenu" > 
        <button (click)="toggleDropdown(); $event.stopPropagation()"
                class="flex items-center justify-between w-full py-2 px-3 hover:bg-verde-bienestar-700 rounded-md">
            {{ datoMenu.etiqueta }}
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 9l-7 7-7-7" />
            </svg>
        </button>

        <div *ngIf="isMenuOpen"
            class="md:absolute left-0 z-20 w-full md:w-64 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg dark:bg-gray-800">
            <ul class="p-2 space-y-1">
                <li *ngFor="let sub of datoMenu.subModulos"
                    (click)="isMenuOpen = false; isNavOpen = false">
                    <a [routerLink]="sub.rutaModulo"
                        class="flex items-center p-2 text-gray-700 rounded-md hover:bg-gray-100">
                    <i [class]="sub.icono + ' mr-2'"></i>
                        {{ sub.etiqueta }}
                    </a>
                </li>
            </ul>
        </div>
    </ng-template>`,
})
export class CompNavComponent implements OnInit {
    @Input() modulos: Array<any> = [];
    selectedIndex: number        = -1;
    isMenuOpen: boolean          = false;
    isNavOpen:boolean            = false;

  constructor(public router: Router) {}

  async ngOnInit() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd) // Filtrar solo los eventos de fin de navegación
    ).subscribe(async (event: NavigationEnd) => {
        let modulo = await this.verificarLst("modulos");
        this.selectedIndex = modulo.findIndex((_) => _.rutaModulo == event.urlAfterRedirects);

    });
  }

      // Función para seleccionar un menú
    selectMenu(index: number, menu:any) {  
        this.selectedIndex = index;

      if (menu.rutaModulo != undefined) {
        this.router.navigate([menu.rutaModulo ?? "/inicio"]);
        this.isMenuOpen = false;
      }
    }
  
  toggleDropdown() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  verificarLst(nombreLst: string = "modulos"): Promise<any[]> {

        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
            const lista = (this as any)[nombreLst];
                
            if (lista.length > 0) {
                clearInterval(interval); // Detiene el intervalo
                resolve(lista); // Resuelve la promesa con la lista
            }
        }, 50); 

        // Opcional: Rechazar después de un tiempo límite si no se llena la lista
        setTimeout(() => {
                const lista = (this as any)[nombreLst];
                if (!Array.isArray(lista) || lista.length === 0) {
                    clearInterval(interval); // Detiene el intervalo
                    reject('La lista no tiene contenido después del tiempo límite');
                }
            },2000); // 2 segundos de límite
        });
    }
}
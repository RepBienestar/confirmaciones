import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.component.html',
    styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

    // Estado de animación
    mostrarCheck: boolean = false;
    mostrarContenido: boolean = false;
    mostrarBotones: boolean = false;

    // Lista de características completadas
    caracteristicas = [
        { nombre: 'Angular 18 configurado', completado: true, delay: 100 },
        { nombre: 'Tailwind CSS funcionando', completado: true, delay: 200 },
        { nombre: 'NgxExtendedPdfViewer instalado', completado: true, delay: 300 },
        { nombre: 'Drag & Drop de archivos', completado: true, delay: 400 },
        { nombre: 'Componentes globales listos', completado: true, delay: 500 },
        { nombre: 'Pipes personalizados', completado: true, delay: 600 },
        { nombre: 'Sin advertencias de Vite', completado: true, delay: 700 }
    ];

    // Información del proyecto
    infoProyecto = {
        nombre: 'Plantilla Nuevas Aplicaciones',
        version: '1.0.0',
        angular: '18.2.12',
        estado: 'Listo para desarrollo'
    };

    constructor() { }

    ngOnInit(): void {
        this.iniciarAnimaciones();
    }

    private iniciarAnimaciones(): void {
        // Mostrar check principal
        setTimeout(() => {
            this.mostrarCheck = true;
        }, 300);

        // Mostrar contenido
        setTimeout(() => {
            this.mostrarContenido = true;
        }, 800);

        // Mostrar botones
        setTimeout(() => {
            this.mostrarBotones = true;
        }, 1500);
    }

    // Método para reiniciar animaciones
    reiniciarAnimaciones(): void {
        this.mostrarCheck = false;
        this.mostrarContenido = false;
        this.mostrarBotones = false;
        this.iniciarAnimaciones();
    }

    // Método para ir a documentación
    irADocumentacion(): void {
        window.open('https://angular.io/docs', '_blank');
    }

    // Método para empezar proyecto
    empezarProyecto(): void {
        console.log('¡Iniciando el desarrollo! 🚀');
        // Aquí puedes agregar navegación o lógica adicional
    }
}
// src/app/servicios/permisos.service.ts
import { Injectable } from '@angular/core';
import { ServicioGeneralService } from './servicio-general.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class PermisosService {
    private permisosValidadosSubject = new BehaviorSubject<boolean>(false);
    public permisosValidados$ = this.permisosValidadosSubject.asObservable();

    constructor(private servicioGeneral: ServicioGeneralService) {
        // Iniciar la validación de permisos con un retraso
        setTimeout(() => {
            this.validarPermisos();
        }, 500);
    }

    private validarPermisos(): void {
        console.log('Validando permisos de acceso en servicio...');
        console.log('Acciones disponibles:', this.servicioGeneral.acciones);
        this.permisosValidadosSubject.next(true);
    }

    /**
     * Verifica si el usuario tiene un permiso específico
     * @param permisoCompleto Permiso en formato 'modulo.permiso'
     * @returns true si tiene permiso, false si no
     */
    tienePermiso(permisoCompleto: string): boolean {
        if (!this.servicioGeneral.acciones) {
            return false;
        }

        const partes = permisoCompleto.split('.');
        if (partes.length !== 2) {
            console.error('Formato de permiso incorrecto. Debe ser "modulo.permiso"');
            return false;
        }

        const [modulo, permiso] = partes;
        return !!this.servicioGeneral.acciones[modulo]?.[permiso];
    }

    /**
     * Verifica si el usuario tiene al menos uno de los permisos especificados
     * @param permisos Array de permisos en formato 'modulo.permiso'
     * @returns true si tiene al menos un permiso, false si no
     */
    tieneAlgunPermiso(permisos: string[]): boolean {
        return permisos.some(permiso => this.tienePermiso(permiso));
    }
}
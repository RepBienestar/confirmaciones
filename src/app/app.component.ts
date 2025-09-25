import { Component, OnInit } from '@angular/core';
import { ServicioGeneralService } from './servicios/servicio-general.service';
import { Router } from '@angular/router';
import { LoadingService } from './servicios/loading.service';
import { InactivityService } from './servicios/inactividad.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'Plantilla de Aplicaciones';
  menuModulo: any;
  isMenuOpen: boolean = false;

  constructor(
    public request: ServicioGeneralService,
    public router: Router,
    public loadingService: LoadingService,
    private inactivityService: InactivityService
  ) { }

  async ngOnInit() {
    //valida de sesion
    this.request.modulos = JSON.parse(localStorage.getItem('modulosApp') ?? "[]");
    
  }

  salir() {}

}

import { APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { InicioComponent } from './components/inicio/inicio.component';

import { AuthInterceptor, ServicioGeneralService } from './servicios/servicio-general.service';
import { ToastrModule } from 'ngx-toastr';
import { NgxFileDropModule } from 'ngx-file-drop';

// Cambio principal: reemplazar ng2-pdf-viewer por ngx-extended-pdf-viewer
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { DatosPipesPipe } from './pipes/datos-pipes.pipe';
import { CompGlobalesModule } from './comp-globales/comp-globales.module';
import { environment } from '../environments/environment.development';

export function cargarToken( servicio : ServicioGeneralService ) {
    if ( environment.production ) {
        return () => servicio.validarSession();
    } else {
        return () => servicio.cargarToken();
    }
}

@NgModule( {
    declarations : [
        AppComponent,
        InicioComponent
    ],
    imports      : [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        NgxFileDropModule,
        
        // Nuevo módulo de PDF sin advertencias de Vite
        NgxExtendedPdfViewerModule,
        
        CompGlobalesModule,
        ToastrModule.forRoot( {
            timeOut           : 5000,
            preventDuplicates : true,
            closeButton       : true
        } )
    ],
    schemas      : [ CUSTOM_ELEMENTS_SCHEMA ],
    providers    : [
        ServicioGeneralService,
        provideHttpClient(
            withFetch()
        ),
        { provide : APP_INITIALIZER, useFactory : cargarToken, deps : [ ServicioGeneralService ], multi : true },
        { provide : HTTP_INTERCEPTORS, useClass : AuthInterceptor, multi : true }
    ],
    bootstrap    : [ AppComponent ]
} )
export class AppModule {}

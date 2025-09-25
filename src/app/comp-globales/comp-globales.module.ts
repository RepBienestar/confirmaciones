import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NgxFileDropModule } from 'ngx-file-drop';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CompGlobalesComponent } from './componentes/comp-globales.component';
import { CompNavComponent } from './componentes/comp-nav.component';
import { SinDatosComponent } from './componentes/comp-sindatos.component';
import { CompNotFoundComponent } from './componentes/comp-not-found.component';
import { CompGlobalesRoutingModule } from './componentes/globales-routing.module';
import { FechaInput } from './componentes/input-fecha.component';
import { CargaArchivoComponent } from './carga-archivo/carga-archivo.component';

@NgModule({
  declarations: [
    CompGlobalesComponent,
    CompNavComponent,
    SinDatosComponent,
    CompNotFoundComponent,
    FechaInput,
    CargaArchivoComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CompGlobalesRoutingModule,
    NgxFileDropModule,
    PdfViewerModule
  ],
  exports: [
    CompGlobalesComponent,
    CompNavComponent,
    SinDatosComponent,
    CompNotFoundComponent,
    FechaInput,
    CargaArchivoComponent
  ]
})
export class CompGlobalesModule { }

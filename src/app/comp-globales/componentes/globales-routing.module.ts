import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompNotFoundComponent } from './comp-not-found.component';

const routes: Routes = [{ path: '', component: CompNotFoundComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompGlobalesRoutingModule { }

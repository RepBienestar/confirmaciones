import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {

  const token = localStorage.getItem('token');


    if (token) {
      const permisos = localStorage.getItem('permisos');

      return true; 
    } else {
      const router = inject(Router); 
      router.navigate(['/inicio']); 
      return false;
    }
};

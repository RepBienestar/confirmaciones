import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private inactivityTimeout = 1000 * 60 * 3; // 5 minutos de inactividad
  private activityTimeoutId: any;
  private inactivitySubject: Subject<boolean> = new Subject<boolean>();

  constructor(private ngZone: NgZone) {
    this.startMonitoring();
  }

  // Método para detectar inactividad
  private startMonitoring(): void {
    // Detecta eventos de actividad
    const events = ['mousemove', 'keydown', 'click', 'scroll'];

  
    // Se suscribe a los eventos para detectar la actividad
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });

    // Inicializa el temporizador de inactividad
    this.resetInactivityTimer();
  }

  // Resetea el temporizador cada vez que se detecta actividad
  private resetInactivityTimer(): void {
    
    if (this.activityTimeoutId) {
      clearTimeout(this.activityTimeoutId);
    }
    // Reinicia el temporizador
    this.activityTimeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        this.inactivitySubject.next(true); // Notifica que ha pasado el tiempo de inactividad
      });
    }, this.inactivityTimeout);

  }

  // Devuelve un Observable que se puede suscribir para detectar inactividad
  get inactivityDetected$(): Observable<boolean> {
    return this.inactivitySubject.asObservable().pipe(
      debounceTime(100)
    );  
  }
}

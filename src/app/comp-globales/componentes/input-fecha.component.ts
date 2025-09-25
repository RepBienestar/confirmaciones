import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild,  } from '@angular/core';
import flatpickr from 'flatpickr';
import { Spanish } from 'flatpickr/dist/l10n/es.js';

@Component({
  selector: 'app-fechainput',
  template: `
    <div class="mb-5 max-full">
        <ng-content #titulo>

        </ng-content>

        <div class="relative mt-0 pt-0">
            <!-- Ícono calendario -->
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                </svg>
            </div>
    
            <!-- Input -->
            <input #fechaInput id="fechaInput" name="fechaInput" type="text"
                (input)="verFecha()" placeholder="Seleccione la fecha" [(ngModel)]="fechaSeleccionada"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700
                dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500
                dark:focus:border-blue-500" />
        </div>
    </div>
  `,
})
export class FechaInput implements AfterViewInit,OnChanges {

    @ViewChild('fechaInput') fechaInput!: ElementRef;
    @Input() valor: any;
    @Input() minDate: string = "today";
    @Input() maxDate: any;
    @Output() valorChange = new EventEmitter<string>(); 
        

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['valor']) {
            if (changes['valor'].currentValue == undefined) {
                this.fechaInput.nativeElement.value = "";
            }
        }
    }

    ngAfterViewInit(): void {
         flatpickr(this.fechaInput.nativeElement, {
            locale: Spanish,
             dateFormat: 'd/m/Y',
             minDate:this.minDate,
             maxDate: this.maxDate,
        
        });
    }
    
    fechaSeleccionada:any;

    verFecha() {
        this.valor = this.fechaSeleccionada;
        this.valorChange.emit(this.valor);
    }
}

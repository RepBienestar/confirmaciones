import { AfterViewInit, Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-comp-globales',
  template: `
      <div class="relative group inline-block">
            <ng-content>
    
            </ng-content>
            <div 
                id="tooltip-default" 
                role="tooltip"
                class="absolute z-10 hidden group-hover:block px-3 py-2 
                                                    text-sm font-medium text-white bg-gray-900 rounded-lg 
                                                    shadow-sm -top-10 left-12 transform -translate-x-1/2 whitespace-nowrap dark:bg-gray-700">
                {{mensajeTooltip}}
                <div class="tooltip-arrow" data-popper-arrow></div>
            </div>  
      </div>
  `,
})
export class CompGlobalesComponent implements AfterViewInit {
  @Input() tooltipId: string      = 'tooltip-default';
  @Input() mensajeTooltip: string = 'No hay mensaje';
  mostraModal: boolean            = false;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit(): void {
    const content = this.elementRef.nativeElement.querySelector('ng-content');
    if (content) {
      content.setAttribute('aria-describedby', 'tooltip-default');
    }
  }
  


}

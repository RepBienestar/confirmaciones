// generic-table.component.ts
import { ContentChild, CUSTOM_ELEMENTS_SCHEMA, TemplateRef } from '@angular/core';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
    BadgeConfig,
    SortDirection,
    SortEvent,
    TableAction,
    TableColumn,
    TableConfig
} from '../model/generic-table.model';
import { OnChanges, SimpleChanges } from '@angular/core';

@Component( {
    selector    : 'app-generic-table',
    templateUrl : './generic-table.component.html',
    standalone  : true,
    imports: [
        CommonModule,
        FormsModule
    ],
    schemas      : [ CUSTOM_ELEMENTS_SCHEMA ],
} )
export class GenericTableComponent implements OnInit, OnChanges {
    @Input() data : any[]            = [];
    @Input() columns : TableColumn[] = [];
    @Input() actions : TableAction[] = [];
    @Input() config : TableConfig    = {
        showCheckbox      : false,
        pageSize          : 10,
        pageSizeOptions   : [ 5, 10, 25, 50 ],
        showPagination    : true,
        showSearch        : true,
        searchPlaceholder : 'Buscar...',
        emptyMessage: 'No hay datos disponibles'
    };
    
    @Output() rowAction      = new EventEmitter<{ action : string, item : any }>();
    @Output() rowSelect      = new EventEmitter<any[]>();
    @Output() pageChange     = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();
    @Output() sortChange = new EventEmitter<SortEvent>();
    @ContentChild('customCell', { static: true }) customTemplate!: TemplateRef<any>;

    
    ngOnChanges( changes : SimpleChanges ) : void {
        if ( changes[ 'data' ] && changes[ 'data' ].currentValue ) {
            this.filteredData = [ ...this.data ];
            this.updateDisplayData();
        }
    }
    
    // Variables de estado
    filteredData : any[]  = [];
    displayData : any[]   = [];
    selectedItems : any[] = [];
    searchTerm : string   = '';
    
    // Variables de paginación
    currentPage : number = 1;
    totalPages : number  = 1;
    
    // Variables de ordenamiento
    sortProperty : string         = '';
    sortDirection : SortDirection = '';
    
    ngOnInit() : void {
        this.filteredData = [ ...this.data ];
        this.updateDisplayData();
    }
    
    // Gestión de filtros y búsqueda
    applySearch( event : Event ) : void {
        const target    = event.target as HTMLInputElement;
        const term      = target.value.toLowerCase();
        this.searchTerm = term;
        
        if ( !term ) {
            this.filteredData = [ ...this.data ];
        } else {
            this.filteredData = this.data.filter( item => {
                return this.columns.some( column => {
                    if ( !column.filterable ) return false;
                    
                    const value = this.getPropertyValue( item, column.property );
                    return value && value.toString().toLowerCase().includes( term );
                } );
            } );
        }
        
        this.currentPage = 1;
        this.updateDisplayData();
    }
    
    // Manejo del cambio de tamaño de página
    onPageSizeChange( event : Event ) : void {
        const target = event.target as HTMLSelectElement;
        const size   = parseInt( target.value, 10 );
        this.setPageSize( size );
    }
    
    // Gestión de paginación
    setPage( page : number ) : void {
        if ( page < 1 || page > this.totalPages ) return;
        
        this.currentPage = page;
        this.updateDisplayData();
        this.pageChange.emit( page );
    }
    
    setPageSize( size : number ) : void {
        this.config.pageSize = size;
        this.currentPage     = 1;
        this.updateDisplayData();
        this.pageSizeChange.emit( size );
    }
    
    // Ordenamiento
    sort( column : TableColumn ) : void {
        if ( !column.sortable ) return;
        
        if ( this.sortProperty === column.property ) {
            // Cambiar dirección de ordenamiento
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? '' : 'asc';
        } else {
            // Nueva columna para ordenar
            this.sortProperty  = column.property;
            this.sortDirection = 'asc';
        }
        
        const sortEvent : SortEvent = {
            property  : this.sortProperty,
            direction : this.sortDirection
        };
        
        this.sortData();
        this.updateDisplayData();
        this.sortChange.emit( sortEvent );
    }
    
    sortData() : void {
        if ( !this.sortProperty || this.sortDirection === '' ) {
            // Restaurar al orden original
            this.filteredData = [ ...this.data ].filter( item => {
                return !this.searchTerm || this.columns.some( column => {
                    if ( !column.filterable ) return false;
                    const value = this.getPropertyValue( item, column.property );
                    return value && value.toString().toLowerCase().includes( this.searchTerm );
                } );
            } );
            return;
        }
        
        this.filteredData.sort( ( a, b ) => {
            const valueA = this.getPropertyValue( a, this.sortProperty );
            const valueB = this.getPropertyValue( b, this.sortProperty );
            
            if ( valueA === valueB ) return 0;
            
            const compareResult = valueA < valueB ? -1 : 1;
            return this.sortDirection === 'asc' ? compareResult : -compareResult;
        } );
    }
    
    // Manejar selección de filas
    toggleAllSelection( event : Event ) : void {
        const target  = event.target as HTMLInputElement;
        const checked = target.checked;
        
        if ( checked ) {
            // Seleccionar todas las filas que son seleccionables
            this.selectedItems = this.filteredData.filter( item => {
                return !this.config.checkboxFilterFn || this.config.checkboxFilterFn( item );
            } );
        } else {
            this.selectedItems = [];
        }
        
        this.rowSelect.emit( this.selectedItems );
    }
    
    toggleRowSelection( event : Event, item : any ) : void {
        const target  = event.target as HTMLInputElement;
        const checked = target.checked;
        
        if ( checked ) {
            this.selectedItems.push( item );
        } else {
            const index = this.selectedItems.findIndex( selectedItem => selectedItem === item );
            if ( index !== -1 ) {
                this.selectedItems.splice( index, 1 );
            }
        }
        
        this.rowSelect.emit( this.selectedItems );
    }
    
    isRowSelected( item : any ) : boolean {
        return this.selectedItems.includes( item );
    }
    
    isRowSelectable( item : any ) : boolean {
        return !this.config.checkboxFilterFn || this.config.checkboxFilterFn( item );
    }
    
    // Gestión de acciones
    handleAction( action : string, item : any ) : void {
        this.rowAction.emit( { action, item } );
    }
    
    isActionVisible( action : TableAction, item : any ) : boolean {
        return !action.showFn || action.showFn( item );
    }
    
    // Helper para obtener valores de propiedades anidadas (ej: 'user.address.street')
    getPropertyValue( obj : any, property : string ) : any {
        const props = property.split( '.' );
        let value   = obj;
        
        for ( const prop of props ) {
            if ( value === null || value === undefined ) return null;
            value = value[ prop ];
        }
        
        return value;
    }
    
    // Actualizar datos mostrados según paginación
    updateDisplayData() : void {
        if ( !this.config.showPagination ) {
            this.displayData = this.filteredData;
            return;
        }
        
        const pageSize  = this.config.pageSize || 10;
        this.totalPages = Math.ceil( this.filteredData.length / pageSize );
        
        // Ajustar página actual si es necesario
        if ( this.currentPage > this.totalPages ) {
            this.currentPage = this.totalPages || 1;
        }
        
        const start = ( this.currentPage - 1 ) * pageSize;
        const end   = start + pageSize;
        
        this.displayData = this.filteredData.slice( start, end );
    }
    
    // Obtener el índice del último elemento mostrado en la página actual
    getLastItemIndex() : number {
        const pageSize = this.config.pageSize || 10;
        return Math.min( this.currentPage * pageSize, this.filteredData.length );
    }
    
    // Obtener un array para los números de página
    getPagesArray() : number[] {
        const pages = [];
        for ( let i = 1; i <= this.totalPages; i++ ) {
            pages.push( i );
        }
        return pages;
    }
    
    // Manejo de estados
    getStatusBadge( estado : string ) : BadgeConfig {
        // Mapeo de estados a configuraciones de badge
        switch ( estado.toLowerCase() ) {
            case 'activo':
            case 'aprobado':
            case 'GERENCIA AUTORIZADO':
            case 'autorizado':
                return {
                    text  : estado,
                    class : 'bg-green-100 text-green-700',
                    icon  : 'check-circle-2'
                };
            case 'pendiente':
            case 'GERENCIA PENDIENTE':
                return {
                    text  : estado,
                    class : 'bg-yellow-100 text-yellow-700',
                    icon  : 'clock'
                };
            case 'cotizado':
                return {
                    text  : estado,
                    class : 'bg-blue-100 text-blue-700',
                    icon  : 'clock'
                };
            case 'comprado':
                return {
                    text  : estado,
                    class : 'bg-violet-100 text-violet-700',
                    icon  : 'clock'
                };
            case 'rechazado':
            case 'denegado':
            case 'no autorizado':
            case 'GERENCIA NO AUTORIZADO':
                return {
                    text  : estado,
                    class : 'bg-red-100 text-red-600',
                    icon  : 'x-circle'
                };
            case 'error':
            case 'alerta':
                return {
                    text  : estado,
                    class : 'bg-orange-100 text-orange-700',
                    icon  : 'alert-circle'
                };
            default:
                return {
                    text  : estado,
                    class : 'bg-gray-100 text-gray-700',
                    icon  : 'info'
                };
        }
    }
    
    // Método para añadir al componente GenericTableComponent
    
    /**
     * Muestra un diálogo con los IDs de los elementos seleccionados o un mensaje si no hay selecciones
     */
    showSelectedIds() : void {
        if ( !this.selectedItems || this.selectedItems.length === 0 ) {
            alert( 'No hay elementos seleccionados' );
            return;
        }
        
        // Extraer los IDs de los elementos seleccionados
        // Asumimos que cada elemento tiene una propiedad 'id' - si es diferente, ajusta según necesidad
        const ids = this.selectedItems.map( item => {
            // La propiedad id puede estar en diferentes ubicaciones según tu modelo de datos
            // Intenta diferentes opciones comunes
            if ( item.id !== undefined ) return item.id;
            if ( item.ID !== undefined ) return item.ID;
            if ( item._id !== undefined ) return item._id;
            
            // Si no hay campo id específico, busca el primer campo que contenga 'id' en su nombre
            const idField = Object.keys( item ).find( key => key.toLowerCase().includes( 'id' ) );
            if ( idField ) return item[ idField ];
            
            // Si todo falla, devuelve el objeto completo como string
            return JSON.stringify( item );
        } );
        
        // Crear un mensaje con los IDs
        const message = `
    Elementos seleccionados (${ ids.length }):
    ${ ids.join( ', ' ) }
  `;
        
        // Mostrar el mensaje en una alerta - en una aplicación real podrías usar un modal más sofisticado
        alert( message );
        
        // También podrías emitir un evento con los IDs si quieres que el componente padre los maneje
        // this.selectionIds.emit(ids);
    }
}

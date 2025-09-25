import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FileSystemFileEntry, FileSystemDirectoryEntry, NgxFileDropEntry } from 'ngx-file-drop';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2';

type ModalKeys = 'modalImagen';
@Component({
  selector: 'app-carga-archivo',
  templateUrl: './carga-archivo.component.html',
  styleUrl: './carga-archivo.component.css'
})
export class CargaArchivoComponent implements OnInit,OnChanges {

  [x: string]: any;
  lstUsuarios: any;
  @Input() archivos: File | undefined;
  @Input() mostrarCarga: boolean = true;
  @Input() archivosCargados: File[] = [];
  @Output() archivosCargadosChange: EventEmitter<File[]> = new EventEmitter<File[]>();
  @Output() verAdjuntoForm: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild( 'modalImagen' ) modalImagen! : ElementRef;

  public files: NgxFileDropEntry[] = [];
  public file: File[] = [];

  fileToUpload: any = null;
  fileUrl: any      = null;
  fileType: string  = '';
  pdfData: any      = null;
  pageNumber: number = 1;
  totalPages: number = 0;
  url:string         = "";
  visible: boolean  = false;
  esImagen: boolean = false;
  mostraModal: boolean = false;
  isDragging: boolean = false;
  configCargaAr: {
    formatos: string,
    limiteArchivos: number,
    multiple: boolean,
    tamanoMax:number
  } = {
    formatos: "",
    limiteArchivos: 1,
    multiple: false,
    tamanoMax:1
  }

  constructor(private sanitizer: DomSanitizer) { 
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.isDragging = false;
    let archivos = changes['archivosCargados'];
    
      if (archivos) {
        if (Array.isArray(archivos.currentValue) && archivos.currentValue.length <= 0)
          {
            this.file = [];
          }
      }
  }

  async ngOnInit() {
    
    this.configCargaAr = await this.cargarConfigArchivos();
    this.verAdjuntoForm.emit(this.verArchivo.bind(this));
    
  }
  
  private mensajeAlerta(icono:string,titulo:string,mensaje:string) {
    Swal.fire(
        {
          icon: 'error',
          title: titulo,
          text: mensaje,
          timer: 3500,
          confirmButtonColor: "#019447"
        }
      );
  }


  private async cargarConfigArchivos() {
    if (sessionStorage.getItem('confCargaAr')) {
      return JSON.parse(sessionStorage.getItem('confCargaAr') ?? '{}');
    }

      return fetch('assets/configArchivos.json', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(async response => { 
          const clonedResponse = response.clone();
          const text = await clonedResponse.text();
                    
          const jsonData = JSON.parse(text);
          sessionStorage.setItem("confCargaAr", JSON.stringify(jsonData));
          return jsonData;
      }).catch((error) => {
        console.error(error);
      });
  }
    

  public dropped(file: NgxFileDropEntry[]): void {
    this.isDragging = false;

    // Validar límite de archivos antes de continuar
    if (this.file.length >= this.configCargaAr.limiteArchivos) {
      this.mensajeAlerta('error', 'Alerta', `Solo se permite subir ${this.configCargaAr.limiteArchivos} archivo(s).`);
      return;
    }

    this.files = file;

    for (const droppedFile of file) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file((archivo: File) => {
          const tamanoMaximoBytes = 1024 * 1024 * this.configCargaAr.tamanoMax;

          if (archivo.size > tamanoMaximoBytes) {
            this.mensajeAlerta('error', 'Alerta', `El archivo supera el tamaño máximo de ${this.configCargaAr.tamanoMax} MB.`);
            return; // Cancela este archivo, no se agrega
          }

          // Validación límite tras cada carga
          if (this.file.length >= this.configCargaAr.limiteArchivos) {
            this.mensajeAlerta('error', 'Alerta', `Solo se permite subir ${this.configCargaAr.limiteArchivos} archivo(s).`);
            return;
          }

          this.file.push(archivo);
          this.archivosCargadosChange.emit(this.file);
        });
      } else {
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        // Si se quiere bloquear carpetas, puedes emitir alerta aquí
      }
    }
  }


  fileOver(event: boolean): void {
    this.isDragging = event;
  }

  public fileLeave(event: any) { }

  public eliminarArchivo(archivo:any) {
    this.file = this.file.filter((file: File) => file.name != archivo.name);
    this.url  = "";
    this.archivosCargadosChange.emit(this.file);
  }

  // En tu componente.ts
  getIconMime(tipo: string): string {
    const map = {
      pdf: 'fa-file-pdf text-red-600',
      image: 'fa-file-image text-green-600',
      word: 'fa-file-word text-blue-600',
      excel: 'fa-file-excel text-green-700',
      zip: 'fa-file-zipper text-yellow-500',
      text: 'fa-file-lines text-gray-600',
      default: 'fa-file text-gray-500'
    };

    if (tipo.includes('pdf')) return map.pdf;
    if (tipo.includes('image')) return map.image;
    if (tipo.includes('word') || tipo.includes('msword')) return map.word;
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return map.excel;
    if (tipo.includes('zip')) return map.zip;
    if (tipo.includes('text')) return map.text;

    return map.default;
  }


  public verArchivo(archivo: any, visible: boolean = true) {
    this.url = URL.createObjectURL(archivo);
    this.esImagen = this.esPdf(archivo)
    this.toggleModal('modalImagen', 'open');
  }

  public esPdf(archivo:any): boolean {
    return archivo.type.includes('pdf');
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileToUpload = file;
      this.fileUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
      this.fileType = file.type;

      if (this.fileType.includes('pdf')) {
        this.url = URL.createObjectURL(file);
      }
    }
  }

  // Cargar el archivo PDF
  loadPdf(file: any): void {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
  }

  // Renderizar la página PDF
  renderPage(pageNumber: number): void {
    this.pdfData.getPage(pageNumber).then((page: any) => {
      const canvas = document.getElementById('pdfCanvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d')!;
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      page.render({
        canvasContext: context,
        viewport: viewport
      });
    });
  }

  // Navegar entre páginas del PDF
  nextPage(): void {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.renderPage(this.pageNumber);
    }
  }

  prevPage(): void {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.renderPage(this.pageNumber);
    }
  }

  validarIMG() {
    if(this.fileType.includes('image')) {
      return true;
    }else{
      return false;
    }
  }
  
  toggleModal(nombreModal: ModalKeys, accion: 'open' | 'close') {
    const modal = this[ nombreModal ];
    if ( !modal ) {return;}
    
    if ( accion === 'open' ) {
        modal.nativeElement.classList.remove( 'hidden' );
        modal.nativeElement.classList.add( 'block' );
       
    } else {
        modal.nativeElement.classList.add( 'hidden' );
        modal.nativeElement.classList.remove( 'block' );
       
    }
  }

}
import { ElementRef, Injectable, ViewChild } from '@angular/core';
import { interval, map, take, Observable, of, throwError } from 'rxjs';
import {
    HttpClient,
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Peticion, Respuesta } from '../interfaces/respuesta_inter';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { catchError, delay, finalize, timeout } from 'rxjs/operators';
import { AsyncValidatorFn } from '@angular/forms';
import { modulos } from '../pipes/permisos_perfil';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})

export class ServicioGeneralService {

    @ViewChild('modalReasignarAnalisis') modalReasignarAnalisis!: ElementRef;
    @ViewChild('modalUsuario') modalUsuario!: ElementRef;


    // Lista de íconos con clases CSS y nombres descriptivos
    fontAwesomeIcons: any = [];
    filteredIcons = [...this.fontAwesomeIcons];
    showIconDropdown = false;
    showIconDropdownModulo: number | null = null; // Permite un índice o null
    showIconDropdownSubmodulo: { modulo: number; submodulo: number } | null = null; // Permite un objeto con índices o null

    datosPersonales: any;
    modulos: Array<string | any> = [];
    aplicaciones: Array<string | any> = [];
    apiUrl: any;
    spinner: any;
    token: string = '';
    icons: Array<string | any> = [];
    acciones: any = {};
    loading: boolean = false;

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
        private router: Router,
        private location: Location
    ) {
    }


    validarSession(accion: string = '') {

        let idSe: string = localStorage.getItem('idSession') ?? '';
        if (['/login', '/lockScreen'].includes(this.location.path().toString())) { return }

        if (idSe == "") return this.mensajeServidor("warning", "No tiene token verifique");

        this.query({
            ruta: 'validarSession',
            body: {
                idSession: idSe,
                accion: accion
            }
        }).subscribe((res: Respuesta) => {
            if (res.respuesta != 'success') {
                this.token = '';
                this.mensajeServidor(res.respuesta, res.mensaje, res.titulo ?? '');
                window.location.href = '/';

            } else if (res.respuesta == 'success' && accion != 'delete') {
                //this.almacenarPermisos(res.datos[0]);
                this.obtenerAccesosApp(res.datos[0]);
            }
        });
    }


    /**
     * Valida periódicamente una variable hasta que tenga un valor o hasta agotar el número máximo de intentos
     * @param opciones Opciones de configuración
     * @param opciones.getVariable Función que devuelve la variable a validar
     * @param opciones.periodo Intervalo entre verificaciones en milisegundos (por defecto: 100ms)
     * @param opciones.canEmitidos Cantidad máxima de intentos (por defecto: 5)
     * @param opciones.propiedadRequerida Propiedad opcional que debe existir en el objeto (si es un objeto)
     * @returns Una promesa que se resuelve con el valor de la variable cuando es válida o se rechaza al agotar los intentos
     */
    async validarobjetosAsync<T>({
        getVariable,
        periodo = 100,
        canEmitidos = 5,
        propiedadRequerida
        }: {
        getVariable: () => T | null | undefined;
        periodo?: number;
        canEmitidos?: number;
        propiedadRequerida?: keyof T;
    }): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        // Verificamos inicialmente si la variable ya tiene valor
        const valorInicial = getVariable();

        // Si el valor ya existe y es válido, resolvemos inmediatamente
        if (this.esValorValido(valorInicial, propiedadRequerida)) {
            resolve(valorInicial as T);
            return;
        }

        // Creamos un observable que emite según el periodo establecido, hasta el máximo de emisiones
        const subscription = interval(periodo).pipe(
            take(canEmitidos)
        ).subscribe({
            next: () => {
                // En cada emisión verificamos si la variable ya tiene valor
                const valor = getVariable();
                // Si el valor es válido, resolvemos la promesa y cancelamos la suscripción
                if (this.esValorValido(valor, propiedadRequerida)) {
                    resolve(valor as T);
                    subscription.unsubscribe();
                }
            },
            complete: () => {
                // Si llegamos aquí es porque se agotaron los intentos sin encontrar un valor válido
                const valorFinal = getVariable();
                if (this.esValorValido(valorFinal, propiedadRequerida)) {
                    // Verificamos una última vez
                    resolve(valorFinal as T);
                } else {
                    resolve({} as T);
                    //reject(new Error(`Se agotaron los ${canEmitidos} intentos sin obtener un valor válido`));
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
    }

    /**
     * Verifica si un valor es válido según los criterios establecidos
     */
    esValorValido<T>(valor: T | null | undefined, propiedadRequerida?: keyof T): boolean {
    // Primero verificamos que el valor no sea null ni undefined
        if (valor === null || valor === undefined) {
            return false;
        }

        // Si se especificó una propiedad requerida y el valor es un objeto, verificamos que tenga dicha propiedad
        if (propiedadRequerida !== undefined && typeof valor === 'object') {
            return propiedadRequerida in valor && (valor as any)[propiedadRequerida] !== null && (valor as any)[propiedadRequerida] !== undefined;
        }

        // Si no se especificó propiedad o no es un objeto, simplemente retornamos true
        return true;
    }



    validarRuta(modulo: any) {
        if (modulo.desplegable == undefined) {
            this.router.navigate([modulo.ruta]).then(r => { });
        }
    }

    almacenarPermisos(datPersonales: any) {

        this.datosPersonales = datPersonales;
        let modulosApp = JSON.parse(this.datosPersonales.modulos);

        if (this.datosPersonales.aplicaciones != undefined) {
            this.aplicaciones = JSON.parse(this.datosPersonales.aplicaciones);
        }
        modulosApp.forEach((element: modulos) => {
            this.acciones[element.modulo] = Object.fromEntries(Object.entries(element.acciones ?? {}).map(([key]) => [key, true]));
        });

        this.modulos = Object.values(modulosApp);
        this.modulos.sort((a, b) => a.orden - b.orden);

        localStorage.setItem('modulos', JSON.stringify(this.modulos));
        localStorage.setItem('datosPersonales', JSON.stringify(this.datosPersonales));
        localStorage.setItem('aplicaciones', JSON.stringify(this.aplicaciones));
    }

    async cargarToken() {

        if (localStorage.getItem('token') == undefined && !environment.production) {
            let token = await this.peticionFetchP({
                url: '',
                metodo: 'POST',
                soloData: true,
                urlP: environment.rutaToken
            });

            if (token != "") {
                localStorage.setItem('token', token.token);
                this.obtenerAccesosApp();
            }
        } else {
            this.obtenerAccesosApp();
        }
    }

    obtenerAccesosApp(permisos: any = null) {
        if (environment.idAplicacion != undefined) {
            this.query({
                ruta: 'aplicacion/obtenerPermisosApp',
                body: { idAplicacion: environment.idAplicacion },

            }).subscribe((res: Respuesta) => {
                this.almacenarPermisos(res.datos[0]);
                if (res.respuesta == "success") {
                    this.almacenarPermisos(res.datos[0]);
                } else {

                    if (this.almacenarPermisos != null) {
                        this.almacenarPermisos(permisos);
                    }
                    this.mensajeServidor("info","No tienes acceso a modulos comunicate a soporte")
                }

            });
        } else {
            this.mensajeServidor("info","Agregue su idAplicación, más información a soporte")
        }
    }


    query( peticion : Peticion ) : Observable<any> {
        // 1. Validación de método HTTP
        const metodosValidos = [ 'get', 'post', 'put', 'delete', 'patch' ];
        const metodo         = ( peticion.tipo ?? 'post' ).toLowerCase();

        if ( !metodosValidos.includes( metodo ) ) {
            const errorMsg = `Método HTTP ${ metodo } no permitido`;
            this.mensajeServidor( 'error', errorMsg, 'Error de configuración' );
            return throwError( () => new Error( errorMsg ) );
        }

        // 2. Configuración inicial
        const url      = environment.apiUrl + peticion.ruta;
        const formData = new FormData();
        formData.append( 'dato', JSON.stringify( peticion.body ) );

        //para cargar archivos en la app
        if (peticion.cargarArchivo && Array.isArray(peticion.cargarArchivo)) {
            if (peticion.cargarArchivo.length == 1) {
                formData.append('file', peticion.cargarArchivo[0] );
            } else {
                peticion.cargarArchivo.forEach((file, index) => {
                formData.append(`file${index}`, file);
            });
            }
        }

        // 3. Estado de loading
        this.loading = true;

        // 4. Realizar petición
        return (this.http as any)[metodo](url,formData).pipe(
            timeout( 10000 ),
            map( ( res : any ) => {
                // 5. Procesar respuesta exitosa
                const respuesta = JSON.parse( JSON.stringify( res ) );

                if ( respuesta.eliSess ) {
                    this.limpiarDatosInternos();
                    window.location.href = '/';
                }

                return res;
            } ),
            catchError((error: any) => {
                // 6. Manejo de errores
                let errorMessage = 'Error desconocido';
                console.log(error);

                if ( error.name === 'TimeoutError' ) {
                    errorMessage = 'Tiempo de espera agotado. Por favor intenta nuevamente.';
                    this.mensajeServidor( 'error', errorMessage, 'Error de conexión' );
                }
                else if (error.status === 401) {
                    errorMessage = error.error?.mensaje || 'Sesión expirada. Por favor inicia sesión nuevamente.';
                    this.limpiarDatosInternos();
                    window.location.href = '/';
                }
                else if ([500,200].includes(error.status)) {
                    errorMessage = error.error?.mensaje || 'Ocurrió un error inesperado en el servidor.';
                    this.mensajeServidor('error', errorMessage, 'Error del servidor');
                }
                else if (error.error instanceof ErrorEvent) {
                    errorMessage = `Error del cliente: ${ error.error.message }`;
                } else {
                    errorMessage = `Error del servidor: ${ error.status } - ${ error.statusText }`;
                }

                return throwError( () => ( {
                    respuesta     : 'error',
                    mensaje       : errorMessage,
                    errorOriginal : error
                } ) );
            } ),
            finalize( () => {
                // 7. Limpieza final
                this.loading = false;
            } )
        );
    }

    limpiarDatosInternos() {
        sessionStorage.clear();
        localStorage.clear();
    }
    // Añadir esta función al ServicioGeneralService

    /**
     * Función para realizar peticiones con FormData y archivos múltiples
     * @param ruta Ruta del endpoint
     * @param datos Datos a enviar como JSON
     * @param archivos Archivos a enviar, pueden ser individuales o múltiples
     */
    queryFormData(ruta: string, datos: any, archivos: File[] | { [key: string]: File }): Observable<any> {
        const url = environment.apiUrl + ruta;

        // Crear un FormData para enviar los datos y los archivos
        const formData = new FormData();

        // Añadir los datos como JSON
        formData.append('dato', JSON.stringify(datos));

        // Añadir los archivos
        if (Array.isArray(archivos)) {
            // Si es un array de archivos, los añadimos con nombres secuenciales (archivo0, archivo1, etc.)
            archivos.forEach((file, index) => {
                formData.append(`archivo${index}`, file);
            });
        } else {
            // Si es un objeto con keys personalizados, usamos esos keys
            Object.keys(archivos).forEach(key => {
                formData.append(key, archivos[key]);
            });
        }

        // Obtener el token de autenticación
        const authToken = localStorage.getItem('token') ?? '';
        const headers = new HttpHeaders().set('Authorization', 'Bearer ' + authToken);

        // Realizar la petición HTTP
        return this.http.post(
            url,
            formData
        ).pipe(
            map(res => {
                let respuesta = JSON.parse(JSON.stringify(res));

                if (respuesta.eliSess != undefined) {
                    localStorage.clear();
                    window.location.href = '/';
                }

                return res;
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    if (error.error?.respuesta != undefined) {
                        this.mensajeServidor(error.error.respuesta, error.error.mensaje, '');
                    }
                }

                // Propagar el error para que otros componentes lo manejen
                return throwError(() => {
                    return {
                        'respuesta': 'error',
                        'mensaje': error
                    }
                });
            })
        );
    }


    mensajeServidor(tipo: 'success' | 'error' | 'info' | 'warning', mensaje: string, titulo: string = '') {
        this.toastr[tipo](mensaje, titulo);
    }


    cargarIconosAplicacion() {
        // Cargar el archivo JSON
        this.http.get<any[]>('assets/fa-icons.json').subscribe({
            next: res => {
                this.fontAwesomeIcons = res;
                this.filteredIcons = res;
                this.icons = res;
            },
            error: err => {
                console.error('Error al cargar los íconos:', err);
            }
        });
    }

    obtenerDiferenciasObj(array1: any, array2: any, key: any) {

        const enArray1PeroNoEnArray2 = array1.filter((obj1: any) =>
            !array2.some((obj2: any) => obj1[key] === obj2[key])
        );

        const enArray2PeroNoEnArray1 = array2.filter((obj2: any) =>
            !array1.some((obj1: any) => obj1[key] === obj2[key])
        );

        return [...enArray1PeroNoEnArray2, ...enArray2PeroNoEnArray1];
    }

    limpiarAcentos = (texto: string): string => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    asyncValidator(): AsyncValidatorFn {
        return (control) => {
            return of(control.value).pipe(
                delay(1000), // Simula una espera (por ejemplo, una llamada al backend)
                map((value) => {
                    return value === 'invalido' ? { invalidValue: true } : null; // Valida si el valor es 'invalido'
                })
            );
        };
    }

    async fethPeticion( url : string, config : {
        metodo : string,
        urlGeneral? : string
    }, body? : any ) : Promise<any> {

        let token : string = localStorage.getItem( 'token' ) ?? '';
        let urlP           = config.urlGeneral ?? environment.apiUrl + url;
        this.loading       = true;
        const controller   = new AbortController();
        const signal       = controller.signal;

        setTimeout( () => controller.abort(), 10000 );
        return fetch( urlP, {
            signal  : signal,
            method  : config.metodo,
            headers : {
                'Content-Type'  : 'application/json',
                'Authorization' : `Bearer ${token}`,
                'AccessApp': environment.baseApp,
                'KeyUnique': environment.keyUnique
            },
            body    : JSON.stringify( body )  // Aquí envías los datos que deseas enviar
        } )
            .then( async response => {
                this.loading         = false;
                const clonedResponse = response.clone();
                try {
                    const text = await clonedResponse.text();

                    const jsonData = JSON.parse( text );
                    if ( jsonData.eliSess != undefined ) {
                        this.limpiarDatosInternos()
                    }

                    // Aquí retornamos directamente el JSON
                    return jsonData;
                } catch ( error ) {
                    return {
                        'respuesta' : 'error',
                        'mensaje'   : error
                    };
                }
            } )
            .catch( error => {
                this.loading = false;
                return {
                    'respuesta' : 'error',
                    'mensaje'   : error
                }
            } );
    }

    async peticionFetchP(datosPeticion: { url: string, metodo: string, soloData?: boolean | false, body?: any, urlP?: string }) {
        let res = await this.fethPeticion(datosPeticion.url, { metodo: datosPeticion.metodo, urlGeneral: datosPeticion.urlP });
        if (datosPeticion?.soloData && res.respuesta == "success") {
            return res.datos;
        } else {
            this.mensajeServidor(res.respuesta, res.mensaje, res.titulo ?? "");
            return [];
        }

    }

}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    private readonly excludedRoutes : string[] = [
        '/login', '/lockScreen', '/not/found/restablecer'
    ];

    constructor(
        private router : Router
    ) { }

    intercept( request : HttpRequest<any>, next : HttpHandler ) : Observable<HttpEvent<any>> {

        let authToken: string | null = localStorage.getItem('token');

        // Configurar headers básicos (siempre se agregan)
        let customHeaders = request.headers
            .set('AccessApp', environment.baseApp)
            .set('KeyUnique', environment.keyUnique);

        // Si hay un token, agregarlo a los headers
        if (authToken) {
            customHeaders = customHeaders.set('Authorization', `Bearer ${authToken}`);
        }

        // Clonar la solicitud con los nuevos headers
        const modifiedRequest = request.clone({ headers: customHeaders });

        // Enviar la solicitud modificada
        return next.handle(modifiedRequest);

        this.router.navigateByUrl( '/' ).then();

        const responsePayload = {
            respuesta : 'error',
            mensaje   : 'Token no definido. Por favor, inicie sesión.'
        };

        return of( new HttpResponse( {
            status : 401,
            body   : responsePayload
        } ) );
    }


    private isExcludedRoute( path : string ) : boolean {
        return this.excludedRoutes.some( route => path === route );
    }

}



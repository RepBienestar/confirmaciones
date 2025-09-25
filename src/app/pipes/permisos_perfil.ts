export interface PermisosPerfil{
    modulos: modulos[],
    aplicaciones:Aplicaciones[]
}


export interface modulos {
    modulo:     string;
    etiqueta:       string;
    icono:        string;
    descripcion: string;
    rutaModulo:  string;
    orden:       number;
    estado:      number;
    subModulos: subModulo[];
    acciones?: Accion;
    checked?: boolean;
    idModulo?: number;

    [prop: string]: any;
}
 export interface Accion {
    [key: string]: number;
}

export interface subModulo {
    modulo : string;
    submodulo : string;
    etiqueta:   string;
    icono:       string;
    descripcion: string;
    rutaModulo:  string;
    orden:       number;
    estado:      number;
    acciones?: {};
    checked?: boolean;
    idSubmodulo?: number;
    
    [prop: string]: any;
}


export interface Aplicaciones {
    idAplicacion:           number;
    nombreAplicacion:       string;
    ruta:                   string;
    icono:                  string;
    idModulo:               string;
    idAccion?:              string | null;
    idSubmodulo?:           string | null;
    idAccionesSubModulo?:   string | null;
}

export class DefaultPerfilPermisos {
    static defaultPermisos() :PermisosPerfil  {
        return {
            modulos: [],
            aplicaciones:[]
        }

    }

    static defaulModulo(): modulos {
        return {
            modulo: "",
            etiqueta: "",
            icono: "",
            descripcion: "",
            rutaModulo: "",
            orden: 0,
            estado: 1,
            subModulos: [],
            acciones: {}
        }
    
    }

    static defaultsubModulo(): subModulo{
         return {
                    modulo: "",
                    submodulo:"",
                    rutaModulo: "",
                    etiqueta: "",
                    icono: "",
                    descripcion: "",
                    orden: 0,
                    estado: 1,
                    acciones: {}
                }
    }

     static defaultAplicacion(): Aplicaciones{
         return   {
                    "idAplicacion": 1,     
                    "nombreAplicacion": "", 
                    "ruta": "",
                    "icono": "", 
                    "idAccion": null, 
                    "idModulo": "", 
                    "idSubmodulo": "", 
                    "idAccionesSubModulo": null
                }
    }
}
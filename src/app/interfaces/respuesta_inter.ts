export interface Peticion {
  ruta?:string,
  tipo?:string,
  body?: Body,
  urlPrincipal?: string,
  aplicaToken?: boolean,
  cargarArchivo?:File[]
}

export interface Body{
  accion?:string,
  data?: any,
  usuario?: string,
  contrasena?: string,
  idSession?: string,
  token?: string,
  [prop: string]: any;
}

export interface Respuesta{
  respuesta: "error" | "success" | "info" | "warning",
  titulo?:string,
  mensaje:string,
  datos?:any
  token?:string
  idSession?:string
}

export interface ActiveToast {
  toastId: number;
  title: string;
  message: string;
}

export interface InterInterface {
  label: string
  url: string
  icon?: string
  command?: Function
  routerLink?: any[] | string
  items?: InterInterface[]
  visible?: boolean
  disabled?: boolean
  separator?: boolean
}
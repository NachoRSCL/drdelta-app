export type Ambito = {
  codigo: "ambiente" | "conservacion" | "metabolismo" | "suelo";
  nombre: string;
  orden: number;
};

export type Variable = {
  id: string;
  ambito: string;
  nombre: string;
  unidad: string;
  direccion: "normal" | "invertida";
  corte_rojo: number;
  corte_verde: number;
  activa: boolean;
};

export type VariableTexto = {
  variable_id: string;
  color: "rojo" | "amarillo" | "verde";
  interpretacion: string;
  accion: string;
  solucion_addvise: string;
};

export type Campo = { id: string; nombre: string; activo: boolean };

export type Profile = {
  id: string;
  email: string;
  rol: "admin" | "ejecutivo";
  activo: boolean;
};

export type Registro = {
  id: string;
  campo_id: string;
  ambito: string;
  ejecutivo_id: string;
  fecha: string;
  estado: "vigente" | "eliminado";
  eliminado_en: string | null;
};

export type RegistroValor = {
  registro_id: string;
  variable_id: string;
  valor: number | null;
  color: "rojo" | "amarillo" | "verde" | null;
};

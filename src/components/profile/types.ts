export interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}

export interface ProfileData {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string | null;
  cidade: string;
  tipo_profissional: string[];
  categoria_id: string;
  descricao: string | null;
  foto_perfil: string | null;
}

export interface EditData extends Partial<ProfileData> {
  foto_perfil_file?: File | null;
}
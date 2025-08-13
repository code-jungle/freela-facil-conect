export interface Profile {
  id: string;
  nome: string;
  cidade: string;
  tipo_profissional: string[];
  descricao: string;
  foto_perfil: string;  
  whatsapp: string;
  telefone: string;
  categorias: {
    nome: string;
  }[];
}

export interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}
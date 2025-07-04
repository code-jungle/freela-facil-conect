export interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  cidade: string;
  tipo_profissional: string;
  categoria_id: string;
  descricao: string;
  foto_perfil: File | null;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface AuthHookReturn {
  loading: boolean;
  validationErrors: ValidationErrors;
  connectionError: boolean;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSignup: (data: SignupFormData) => Promise<void>;
  validateField: (field: string, value: string) => void;
  clearValidationErrors: () => void;
}
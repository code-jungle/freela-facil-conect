import axios from 'axios';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const buscarCep = async (cep: string): Promise<CepData | null> => {
  try {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (response.data.erro) {
      throw new Error('CEP não encontrado');
    }

    return response.data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};

export const formatCep = (cep: string): string => {
  const cepLimpo = cep.replace(/\D/g, '');
  return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
};
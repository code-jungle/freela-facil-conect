import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateEmail, validatePhone, validatePassword, validateRequired } from "@/utils/validation";
import { withRetry, withTimeout } from "@/utils/retryLogic";
import type { SignupFormData, ValidationErrors, AuthHookReturn } from "@/components/auth/types";

export const useAuth = (): AuthHookReturn => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const validateField = (field: string, value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'email':
        if (!validateEmail(value)) {
          errors.email = 'Email inválido';
        } else {
          delete errors.email;
        }
        break;
      case 'whatsapp':
        if (!validatePhone(value)) {
          errors.whatsapp = 'WhatsApp deve ter 10 ou 11 dígitos';
        } else {
          delete errors.whatsapp;
        }
        break;
      case 'cep':
        const cepLimpo = value.replace(/\D/g, '');
        if (cepLimpo.length !== 8) {
          errors.cep = 'CEP deve ter 8 dígitos';
        } else {
          delete errors.cep;
        }
        break;
      case 'password':
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.message!;
        } else {
          delete errors.password;
        }
        break;
      case 'nome':
        const nomeValidation = validateRequired(value, 'Nome');
        if (!nomeValidation.isValid) {
          errors.nome = nomeValidation.message!;
        } else {
          delete errors.nome;
        }
        break;
      case 'cidade':
        const cidadeValidation = validateRequired(value, 'Cidade');
        if (!cidadeValidation.isValid) {
          errors.cidade = cidadeValidation.message!;
        } else {
          delete errors.cidade;
        }
        break;
    }
    
    setValidationErrors(errors);
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const validateSignupForm = (data: SignupFormData): boolean => {
    const errors: ValidationErrors = {};
    
    if (!validateEmail(data.email)) {
      errors.email = 'Email inválido';
    }
    
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message!;
    }
    
    if (!validateRequired(data.nome, 'Nome').isValid) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!validatePhone(data.whatsapp)) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    }
    
    const cepLimpo = data.cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      errors.cep = 'CEP inválido';
    }
    
    if (!validateRequired(data.cidade, 'Cidade').isValid) {
      errors.cidade = 'Cidade é obrigatória';
    }
    
    if (!data.tipo_profissional) {
      errors.tipo_profissional = 'Tipo de profissional é obrigatório';
    }
    
    if (!data.categoria_id) {
      errors.categoria_id = 'Categoria é obrigatória';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel..."
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    if (!validateSignupForm(data)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os campos destacados em vermelho.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setConnectionError(false);
    
    try {
      console.log('Iniciando cadastro...', {
        email: data.email,
        nome: data.nome,
        cep: data.cep,
        whatsapp: data.whatsapp,
        cidade: data.cidade,
        tipo_profissional: data.tipo_profissional,
        categoria_id: data.categoria_id
      });

      const signupOperation = async () => {
        return await withTimeout(
          supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
              emailRedirectTo: `${window.location.origin}/profile`,
              data: {
                nome: data.nome.trim(),
                cep: data.cep.replace(/\D/g, ''),
                whatsapp: data.whatsapp.replace(/\D/g, ''),
                cidade: data.cidade.trim(),
                tipo_profissional: data.tipo_profissional,
                categoria_id: data.categoria_id,
                descricao: data.descricao.trim(),
                foto_perfil: ""
              }
            }
          }),
          15000
        );
      };

      const { data: authData, error: authError } = await withRetry(signupOperation, 3, 2000);
      
      if (authError) {
        console.error('Erro no signup:', authError);
        throw authError;
      }

      console.log('Cadastro realizado com sucesso!', authData);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao FreelaFácil! Redirecionando..."
      });

      setTimeout(() => {
        navigate('/profile');
      }, 1500);

      clearValidationErrors();
      
    } catch (error: any) {
      console.error('Erro detalhado no cadastro:', error);
      
      let errorMessage = "Erro inesperado. Tente novamente.";
      
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        errorMessage = "Problema de conexão. Verifique sua internet e tente novamente.";
        setConnectionError(true);
      } else if (error.message?.includes('User already registered')) {
        errorMessage = "Este email já está cadastrado. Tente fazer login ou use outro email.";
      } else if (error.message?.includes('Invalid email')) {
        errorMessage = "Email inválido. Verifique o formato e tente novamente.";
      } else if (error.message?.includes('Password')) {
        errorMessage = "Senha muito fraca. Use pelo menos 6 caracteres.";
      } else if (error.message?.includes('Rate limit')) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validationErrors,
    connectionError,
    handleLogin,
    handleSignup,
    validateField,
    clearValidationErrors
  };
};
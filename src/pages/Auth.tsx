import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { validateEmail, validatePhone, validatePassword, validateRequired, formatPhone } from "@/utils/validation";
import { withRetry, withTimeout, isRetryableError } from "@/utils/retryLogic";
interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [connectionError, setConnectionError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Estados do formulário de login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Estados do formulário de cadastro
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    nome: "",
    telefone: "",
    whatsapp: "",
    cidade: "",
    tipo_profissional: "",
    categoria_id: "",
    descricao: "",
    foto_perfil: null as File | null
  });

  // Validação em tempo real
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
      case 'telefone':
        if (!validatePhone(value)) {
          errors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
        } else {
          delete errors.telefone;
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

  // Buscar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      const {
        data,
        error
      } = await supabase.from('categorias').select('*').order('nome');
      if (error) {
        console.error('Erro ao buscar categorias:', error);
      } else {
        setCategorias(data || []);
      }
    };
    fetchCategorias();
  }, []);

  // Verificar se usuário já está logado
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      // Removi o redirecionamento automático - deixar o usuário escolher
      // if (session) {
      //   navigate('/profile');
      // }
    };
    checkUser();
  }, [navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
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
  // Validação completa do formulário
  const validateSignupForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!validateEmail(signupData.email)) {
      errors.email = 'Email inválido';
    }
    
    const passwordValidation = validatePassword(signupData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.message!;
    }
    
    if (!validateRequired(signupData.nome, 'Nome').isValid) {
      errors.nome = 'Nome é obrigatório';
    }
    
    if (!validatePhone(signupData.telefone)) {
      errors.telefone = 'Telefone inválido';
    }
    
    if (!validateRequired(signupData.cidade, 'Cidade').isValid) {
      errors.cidade = 'Cidade é obrigatória';
    }
    
    if (!signupData.tipo_profissional) {
      errors.tipo_profissional = 'Tipo de profissional é obrigatório';
    }
    
    if (!signupData.categoria_id) {
      errors.categoria_id = 'Categoria é obrigatória';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário antes de submeter
    if (!validateSignupForm()) {
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
        email: signupData.email,
        nome: signupData.nome,
        telefone: signupData.telefone,
        cidade: signupData.cidade,
        tipo_profissional: signupData.tipo_profissional,
        categoria_id: signupData.categoria_id
      });

      // Função de signup com timeout e retry
      const signupOperation = async () => {
        return await withTimeout(
          supabase.auth.signUp({
            email: signupData.email,
            password: signupData.password,
            options: {
              emailRedirectTo: `${window.location.origin}/profile`,
              data: {
                nome: signupData.nome.trim(),
                telefone: signupData.telefone.replace(/\D/g, ''), // Só números
                whatsapp: signupData.whatsapp?.replace(/\D/g, '') || signupData.telefone.replace(/\D/g, ''),
                cidade: signupData.cidade.trim(),
                tipo_profissional: signupData.tipo_profissional,
                categoria_id: signupData.categoria_id,
                descricao: signupData.descricao.trim(),
                foto_perfil: ""
              }
            }
          }),
          15000 // 15 segundos timeout
        );
      };

      // Executar com retry logic
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

      // Aguardar um pouco antes de redirecionar para garantir que o perfil foi criado
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

      // Limpar formulário
      setSignupData({
        email: "",
        password: "",
        nome: "",
        telefone: "",
        whatsapp: "",
        cidade: "",
        tipo_profissional: "",
        categoria_id: "",
        descricao: "",
        foto_perfil: null
      });
      setValidationErrors({});
      
    } catch (error: any) {
      console.error('Erro detalhado no cadastro:', error);
      
      let errorMessage = "Erro inesperado. Tente novamente.";
      let shouldShowRetry = false;
      
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        errorMessage = "Problema de conexão. Verifique sua internet e tente novamente.";
        shouldShowRetry = true;
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
        variant: "destructive",
        ...(shouldShowRetry && {
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSignup(e)}
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Tentar novamente
            </Button>
          )
        })
      });
    } finally {
      setLoading(false);
    }
  };
  const categoriasFiltradas = signupData.tipo_profissional ? categorias.filter(c => c.tipo_profissional === signupData.tipo_profissional) : [];
  const gerarDescricaoAutomatica = (categoria: string, tipo: string) => {
    const categoria_obj = categorias.find(c => c.id === categoria);
    if (!categoria_obj) return "";
    const tipoTexto = tipo === 'freelancer' ? 'freelancer' : 'prestador de serviços';
    return `Sou ${tipoTexto} especializado em ${categoria_obj.nome.toLowerCase()}. Tenho experiência na área e estou sempre disponível para novos projetos. Entre em contato para conhecer melhor meu trabalho!`;
  };
  return <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-4">
      <div className="w-full max-w-lg sm:max-w-md">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-12 px-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">FreelaFácil</CardTitle>
            <CardDescription>
              Área do profissional
            </CardDescription>
          </CardHeader>

          <CardContent>
            {connectionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Problema de conexão detectado</span>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Verifique sua internet. Os dados serão salvos localmente.
                </p>
              </div>
            )}
            
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} inputMode="email" autoComplete="email" required className="h-12 text-base bg-gray-100" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password">Senha</Label>
                    <Input id="password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} autoComplete="current-password" required className="h-12 text-base bg-zinc-100" />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base mt-8" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                     <div className="space-y-3">
                       <Label htmlFor="signup-email">Email</Label>
                       <Input 
                         id="signup-email" 
                         type="email" 
                         value={signupData.email} 
                         onChange={e => {
                           const value = e.target.value;
                           setSignupData({
                             ...signupData,
                             email: value
                           });
                           if (value) validateField('email', value);
                         }}
                         onBlur={e => validateField('email', e.target.value)}
                         inputMode="email" 
                         autoComplete="email" 
                         required 
                         className={`h-12 text-base bg-gray-100 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                       />
                       {validationErrors.email && (
                         <p className="text-sm text-red-500 flex items-center gap-1">
                           <AlertCircle className="w-4 h-4" />
                           {validationErrors.email}
                         </p>
                       )}
                     </div>

                     <div className="space-y-3">
                       <Label htmlFor="signup-password">Senha</Label>
                       <Input 
                         id="signup-password" 
                         type="password" 
                         value={signupData.password} 
                         onChange={e => {
                           const value = e.target.value;
                           setSignupData({
                             ...signupData,
                             password: value
                           });
                           if (value) validateField('password', value);
                         }}
                         onBlur={e => validateField('password', e.target.value)}
                         autoComplete="new-password" 
                         required 
                         className={`h-12 text-base bg-gray-100 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                       />
                       {validationErrors.password && (
                         <p className="text-sm text-red-500 flex items-center gap-1">
                           <AlertCircle className="w-4 h-4" />
                           {validationErrors.password}
                         </p>
                       )}
                     </div>
                  </div>

                   <div className="space-y-3">
                     <Label htmlFor="nome">Nome completo</Label>
                     <Input 
                       id="nome" 
                       value={signupData.nome} 
                       onChange={e => {
                         const value = e.target.value;
                         setSignupData({
                           ...signupData,
                           nome: value
                         });
                         if (value) validateField('nome', value);
                       }}
                       onBlur={e => validateField('nome', e.target.value)}
                       autoComplete="name" 
                       required 
                       className={`h-12 text-base bg-gray-100 ${validationErrors.nome ? 'border-red-500 focus:border-red-500' : ''}`}
                     />
                     {validationErrors.nome && (
                       <p className="text-sm text-red-500 flex items-center gap-1">
                         <AlertCircle className="w-4 h-4" />
                         {validationErrors.nome}
                       </p>
                     )}
                   </div>

                   <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4">
                     <div className="space-y-3">
                       <Label htmlFor="telefone">Telefone</Label>
                       <Input 
                         id="telefone" 
                         value={signupData.telefone} 
                         onChange={e => {
                           const value = formatPhone(e.target.value);
                           setSignupData({
                             ...signupData,
                             telefone: value
                           });
                           if (value) validateField('telefone', value);
                         }}
                         onBlur={e => validateField('telefone', e.target.value)}
                         placeholder="(11) 99999-9999" 
                         inputMode="tel" 
                         autoComplete="tel" 
                         required 
                         className={`h-12 text-base bg-gray-100 ${validationErrors.telefone ? 'border-red-500 focus:border-red-500' : ''}`}
                       />
                       {validationErrors.telefone && (
                         <p className="text-sm text-red-500 flex items-center gap-1">
                           <AlertCircle className="w-4 h-4" />
                           {validationErrors.telefone}
                         </p>
                       )}
                     </div>

                     <div className="space-y-3">
                       <Label htmlFor="whatsapp">WhatsApp</Label>
                       <Input 
                         id="whatsapp" 
                         value={signupData.whatsapp} 
                         onChange={e => {
                           const value = formatPhone(e.target.value);
                           setSignupData({
                             ...signupData,
                             whatsapp: value
                           });
                         }}
                         placeholder="Opcional" 
                         inputMode="tel" 
                         className="h-12 text-base bg-gray-100"
                       />
                     </div>
                   </div>

                   <div className="space-y-3">
                     <Label htmlFor="cidade">Cidade</Label>
                     <Input 
                       id="cidade" 
                       value={signupData.cidade} 
                       onChange={e => {
                         const value = e.target.value;
                         setSignupData({
                           ...signupData,
                           cidade: value
                         });
                         if (value) validateField('cidade', value);
                       }}
                       onBlur={e => validateField('cidade', e.target.value)}
                       autoComplete="address-level2" 
                       required 
                       className={`h-12 text-base bg-gray-100 ${validationErrors.cidade ? 'border-red-500 focus:border-red-500' : ''}`}
                     />
                     {validationErrors.cidade && (
                       <p className="text-sm text-red-500 flex items-center gap-1">
                         <AlertCircle className="w-4 h-4" />
                         {validationErrors.cidade}
                       </p>
                     )}
                   </div>

                   <div className="space-y-3">
                     <Label htmlFor="tipo">Tipo de profissional</Label>
                     <Select value={signupData.tipo_profissional} onValueChange={value => setSignupData({
                       ...signupData,
                       tipo_profissional: value,
                       categoria_id: ""
                     })} required>
                       <SelectTrigger className={`h-12 text-base text-slate-900 bg-gray-100 ${validationErrors.tipo_profissional ? 'border-red-500' : ''}`}>
                         <SelectValue placeholder="Selecione o tipo" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="freelancer">Freelancer</SelectItem>
                         <SelectItem value="prestador">Prestador de Serviço</SelectItem>
                       </SelectContent>
                     </Select>
                     {validationErrors.tipo_profissional && (
                       <p className="text-sm text-red-500 flex items-center gap-1">
                         <AlertCircle className="w-4 h-4" />
                         {validationErrors.tipo_profissional}
                       </p>
                     )}
                   </div>

                   {signupData.tipo_profissional && <div className="space-y-3">
                       <Label htmlFor="categoria">Categoria</Label>
                       <Select value={signupData.categoria_id} onValueChange={value => {
                         setSignupData({
                           ...signupData,
                           categoria_id: value
                         });
                         // Gerar descrição automática
                         if (value && !signupData.descricao) {
                           const descricao = gerarDescricaoAutomatica(value, signupData.tipo_profissional);
                           setSignupData(prev => ({
                             ...prev,
                             categoria_id: value,
                             descricao
                           }));
                         }
                       }} required>
                         <SelectTrigger className={`h-12 text-base ${validationErrors.categoria_id ? 'border-red-500' : ''}`}>
                           <SelectValue placeholder="Selecione a categoria" />
                         </SelectTrigger>
                         <SelectContent>
                           {categoriasFiltradas.map(categoria => <SelectItem key={categoria.id} value={categoria.id}>
                               {categoria.nome}
                             </SelectItem>)}
                         </SelectContent>
                       </Select>
                       {validationErrors.categoria_id && (
                         <p className="text-sm text-red-500 flex items-center gap-1">
                           <AlertCircle className="w-4 h-4" />
                           {validationErrors.categoria_id}
                         </p>
                       )}
                     </div>}

                  <div className="space-y-3">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea id="descricao" value={signupData.descricao} onChange={e => setSignupData({
                    ...signupData,
                    descricao: e.target.value
                  })} placeholder="Conte sobre sua experiência e serviços..." rows={4} className="text-base resize-none bg-gray-100" />
                  </div>

                  {signupData.foto_perfil && <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Arquivo selecionado: {signupData.foto_perfil.name}
                      </p>
                    </div>}

                  <Button type="submit" className="w-full h-12 text-base mt-8" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Auth;
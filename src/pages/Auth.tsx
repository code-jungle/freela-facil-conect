import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
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

  // Buscar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

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
      const { data: { session } } = await supabase.auth.getSession();
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
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o painel...",
      });

      navigate('/profile');
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar usuário na autenticação primeiro (sem a foto)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`,
          data: {
            nome: signupData.nome,
            telefone: signupData.telefone,
            whatsapp: signupData.whatsapp || signupData.telefone,
            cidade: signupData.cidade,
            tipo_profissional: signupData.tipo_profissional,
            categoria_id: signupData.categoria_id,
            descricao: signupData.descricao,
            foto_perfil: "", // Será atualizada pelo trigger se necessário
            has_pending_photo: signupData.foto_perfil ? "true" : "false", // Flag para saber se tem foto pendente
          }
        }
      });

      if (authError) throw authError;

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta. O perfil será criado automaticamente após a confirmação.",
      });

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
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categoriasFiltradas = signupData.tipo_profissional 
    ? categorias.filter(c => c.tipo_profissional === signupData.tipo_profissional)
    : [];

  const gerarDescricaoAutomatica = (categoria: string, tipo: string) => {
    const categoria_obj = categorias.find(c => c.id === categoria);
    if (!categoria_obj) return "";

    const tipoTexto = tipo === 'freelancer' ? 'freelancer' : 'prestador de serviços';
    return `Sou ${tipoTexto} especializado em ${categoria_obj.nome.toLowerCase()}. Tenho experiência na área e estou sempre disponível para novos projetos. Entre em contato para conhecer melhor meu trabalho!`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
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
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={signupData.nome}
                      onChange={(e) => setSignupData({...signupData, nome: e.target.value})}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={signupData.telefone}
                        onChange={(e) => setSignupData({...signupData, telefone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={signupData.whatsapp}
                        onChange={(e) => setSignupData({...signupData, whatsapp: e.target.value})}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={signupData.cidade}
                      onChange={(e) => setSignupData({...signupData, cidade: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de profissional</Label>
                    <Select 
                      value={signupData.tipo_profissional} 
                      onValueChange={(value) => setSignupData({...signupData, tipo_profissional: value, categoria_id: ""})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="freelancer">Freelancer</SelectItem>
                        <SelectItem value="prestador">Prestador de Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {signupData.tipo_profissional && (
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select 
                        value={signupData.categoria_id} 
                        onValueChange={(value) => {
                          setSignupData({...signupData, categoria_id: value});
                          // Gerar descrição automática
                          if (value && !signupData.descricao) {
                            const descricao = gerarDescricaoAutomatica(value, signupData.tipo_profissional);
                            setSignupData(prev => ({...prev, categoria_id: value, descricao}));
                          }
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoriasFiltradas.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              {categoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={signupData.descricao}
                      onChange={(e) => setSignupData({...signupData, descricao: e.target.value})}
                      placeholder="Conte sobre sua experiência e serviços..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="foto">Foto de perfil</Label>
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setSignupData({...signupData, foto_perfil: file});
                      }}
                    />
                    {signupData.foto_perfil && (
                      <p className="text-sm text-muted-foreground">
                        Arquivo selecionado: {signupData.foto_perfil.name}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
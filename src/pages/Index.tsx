import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, User, Phone, LogOut, Star, Users, Zap, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
interface Profile {
  id: string;
  nome: string;
  cidade: string;
  tipo_profissional: string;
  descricao: string;
  foto_perfil: string;
  whatsapp: string;
  telefone: string;
  categorias: {
    nome: string;
  };
}
interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}
const Index = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [selectedCidade, setSelectedCidade] = useState<string>("todas");
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkAuth();

    // Listener para mudanças na autenticação
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar perfis ativos
        const {
          data: profilesData,
          error: profilesError
        } = await supabase.from('profiles').select(`
            id,
            nome,
            cidade,
            tipo_profissional,
            descricao,
            foto_perfil,
            whatsapp,
            telefone,
            categorias (
              nome
            )
          `).eq('ativo', true);
        if (profilesError) throw profilesError;

        // Buscar categorias
        const {
          data: categoriasData,
          error: categoriasError
        } = await supabase.from('categorias').select('*').order('nome');
        if (categoriasError) throw categoriasError;
        setProfiles(profilesData || []);
        setFilteredProfiles(profilesData || []);
        setCategorias(categoriasData || []);

        // Extrair cidades únicas (filtrando valores vazios)
        const cidadesUnicas = [...new Set(profilesData?.map(p => p.cidade).filter(cidade => cidade && cidade.trim() !== ""))].sort();
        setCidades(cidadesUnicas);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = profiles;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(profile => profile.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || profile.categorias?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || profile.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) || profile.descricao?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filtro por tipo
    if (selectedTipo !== "todos") {
      filtered = filtered.filter(profile => profile.tipo_profissional === selectedTipo);
    }

    // Filtro por categoria
    if (selectedCategoria !== "todas") {
      const categoria = categorias.find(c => c.id === selectedCategoria);
      if (categoria) {
        filtered = filtered.filter(profile => profile.categorias.nome === categoria.nome);
      }
    }

    // Filtro por cidade
    if (selectedCidade !== "todas") {
      filtered = filtered.filter(profile => profile.cidade === selectedCidade);
    }
    setFilteredProfiles(filtered);
  }, [searchTerm, selectedTipo, selectedCategoria, selectedCidade, profiles, categorias]);

  // Categorias filtradas por tipo
  const categoriasFiltradas = selectedTipo === "todos" ? categorias : categorias.filter(c => c.tipo_profissional === selectedTipo);
  const gerarMensagemWhatsApp = (nome: string) => {
    return encodeURIComponent(`Olá ${nome}, vi seu perfil no FreelaFácil e gostaria de saber mais sobre seus serviços.`);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando profissionais...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                FreelaFácil
              </h1>
            </div>
            <div className="flex gap-2">
              {user ? <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </> : <Link to="/auth">
                  <Button className="gradient-primary text-white border-0">
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Conecte-se com os 
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> melhores profissionais</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">Encontre freelancers e prestadores de serviços qualificados de maneira rápido e fácil.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-white border-0 px-8 py-4 text-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Cadastre-se Gratuitamente
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg" onClick={() => document.getElementById('profissionais')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                <Search className="w-5 h-5 mr-2" />
                Explorar Profissionais
              </Button>
            </div>
          </div>
        </div>
        
        {/* Features Cards */}
        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Profissionais Verificados</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os perfis são verificados para garantir qualidade e confiabilidade
                </p>
              </CardContent>
            </Card>
            
            <Card className="gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Conexão Instantânea</h3>
                <p className="text-sm text-muted-foreground">
                  Entre em contato direto via WhatsApp com apenas um clique
                </p>
              </CardContent>
            </Card>
            
            <Card className="gradient-card border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Melhor Qualidade</h3>
                <p className="text-sm text-muted-foreground">
                  Encontre os melhores talentos em diversas categorias profissionais
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-card border-y border-border sticky top-[73px] z-40" id="profissionais">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Buscar profissionais..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>

            {/* Tipo de profissional */}
            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="prestador">Prestador de Serviço</SelectItem>
              </SelectContent>
            </Select>

            {/* Categoria */}
            <Select value={selectedCategoria} onValueChange={setSelectedCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categoriasFiltradas.map(categoria => <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>)}
              </SelectContent>
            </Select>

            {/* Cidade */}
            <Select value={selectedCidade} onValueChange={setSelectedCidade}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as cidades</SelectItem>
                {cidades.map(cidade => <SelectItem key={cidade} value={cidade}>
                    {cidade}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Lista de profissionais */}
      <main className="container mx-auto px-4 py-8">
        {filteredProfiles.length === 0 ? <div className="text-center py-12">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Nenhum profissional encontrado</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Tente ajustar os filtros ou remover alguns critérios de busca para encontrar mais profissionais.
            </p>
            <Button variant="outline" onClick={() => {
          setSearchTerm("");
          setSelectedTipo("todos");
          setSelectedCategoria("todas");
          setSelectedCidade("todas");
        }}>
              Limpar Filtros
            </Button>
          </div> : <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {filteredProfiles.length} profissional{filteredProfiles.length !== 1 ? 'is' : ''} {filteredProfiles.length !== 1 ? 'encontrados' : 'encontrado'}
                </h2>
                <p className="text-muted-foreground">
                  Escolha o profissional ideal para seu projeto
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(profile => <Card key={profile.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 gradient-card border-0">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-2xl font-semibold text-white overflow-hidden">
                          {profile.foto_perfil ? <img src={profile.foto_perfil} alt={profile.nome} className="w-full h-full object-cover" /> : profile.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate mb-1">{profile.nome}</h3>
                        <p className="text-sm font-medium text-primary capitalize mb-1">
                          {profile.categorias.nome}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {profile.cidade}
                        </div>
                      </div>
                    </div>

                    {profile.descricao && <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                        {profile.descricao}
                      </p>}

                    <div className="flex gap-2">
                      <Link to={`/profile/${profile.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Ver Perfil
                        </Button>
                      </Link>
                      <Button className="flex-1 gradient-primary text-white border-0" onClick={() => {
                  const whatsapp = profile.whatsapp || profile.telefone;
                  const message = gerarMensagemWhatsApp(profile.nome);
                  window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
                }}>
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>
          </>}
      </main>
    </div>;
};
export default Index;
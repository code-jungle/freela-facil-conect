import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

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
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todas");
  const [selectedCidade, setSelectedCidade] = useState<string>("todas");
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar perfis ativos
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select(`
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
          `)
          .eq('ativo', true);

        if (profilesError) throw profilesError;

        // Buscar categorias
        const { data: categoriasData, error: categoriasError } = await supabase
          .from('categorias')
          .select('*')
          .order('nome');

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

  // Aplicar filtros
  useEffect(() => {
    let filtered = profiles;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(profile =>
        profile.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.categorias.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.cidade.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
  const categoriasFiltradas = selectedTipo === "todos" 
    ? categorias 
    : categorias.filter(c => c.tipo_profissional === selectedTipo);

  const gerarMensagemWhatsApp = (nome: string) => {
    return encodeURIComponent(`Olá ${nome}, vi seu perfil no FreelaFácil e gostaria de saber mais sobre seus serviços.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando profissionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">FreelaFácil</h1>
              <p className="text-muted-foreground">Conectando talentos com oportunidades</p>
            </div>
            <div className="flex gap-2">
              <Link to="/auth">
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Filtros */}
      <section className="bg-muted/50 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar profissionais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
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
                {categoriasFiltradas.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Cidade */}
            <Select value={selectedCidade} onValueChange={setSelectedCidade}>
              <SelectTrigger>
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as cidades</SelectItem>
                {cidades.map((cidade) => (
                  <SelectItem key={cidade} value={cidade}>
                    {cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Lista de profissionais */}
      <main className="container mx-auto px-4 py-8">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum profissional encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou remover alguns critérios de busca.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                {filteredProfiles.length} profissional{filteredProfiles.length !== 1 ? 'is' : ''} encontrado{filteredProfiles.length !== 1 ? 's' : ''}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-2xl font-semibold text-muted-foreground overflow-hidden">
                        {profile.foto_perfil ? (
                          <img 
                            src={profile.foto_perfil} 
                            alt={profile.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          profile.nome.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{profile.nome}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {profile.categorias.nome}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          {profile.cidade}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 capitalize">
                          {profile.tipo_profissional}
                        </div>
                      </div>
                    </div>

                    {profile.descricao && (
                      <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                        {profile.descricao}
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Link to={`/profile/${profile.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Ver Perfil
                        </Button>
                      </Link>
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          const whatsapp = profile.whatsapp || profile.telefone;
                          const message = gerarMensagemWhatsApp(profile.nome);
                          window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
                        }}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
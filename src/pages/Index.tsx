import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header, HeroSection, FilterSection, ProfessionalList, FeedbackButton } from "@/components/home";
import { Profile, Categoria } from "@/types";

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
  const [navigating, setNavigating] = useState(false);

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
        // Buscar perfis ativos com suas categorias
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
            profile_categorias!inner (
              categorias (
                nome
              )
            )
          `).eq('ativo', true);
        if (profilesError) throw profilesError;

        // Transformar dados para o formato esperado
        const transformedProfiles = profilesData?.map(profile => ({
          ...profile,
          categorias: profile.profile_categorias?.map(pc => pc.categorias).filter(Boolean) || []
        })) || [];

        // Buscar categorias
        const {
          data: categoriasData,
          error: categoriasError
        } = await supabase.from('categorias').select('*').order('nome');
        if (categoriasError) throw categoriasError;
        setProfiles(transformedProfiles);
        setFilteredProfiles(transformedProfiles);
        setCategorias(categoriasData || []);

        // Extrair cidades únicas (filtrando valores vazios)
        const cidadesUnicas = [...new Set(transformedProfiles?.map(p => p.cidade).filter(cidade => cidade && cidade.trim() !== ""))].sort();
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
      setNavigating(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setNavigating(false);
    }
  };

  const handleNavigation = (path: string) => {
    setNavigating(true);
    // Pequeno delay para mostrar o loading state
    setTimeout(() => {
      navigate(path);
    }, 100);
  };

  // Aplicar filtros com debounce para melhor performance
  useEffect(() => {
    const applyFilters = () => {
      let filtered = profiles;

      // Filtro por termo de busca
      if (searchTerm) {
        filtered = filtered.filter(profile => 
          profile.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          profile.categorias?.some(cat => cat.nome?.toLowerCase().includes(searchTerm.toLowerCase())) || 
          profile.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          profile.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filtro por tipo
      if (selectedTipo !== "todos") {
        filtered = filtered.filter(profile => profile.tipo_profissional.includes(selectedTipo));
      }

      // Filtro por categoria
      if (selectedCategoria !== "todas") {
        const categoria = categorias.find(c => c.id === selectedCategoria);
        if (categoria) {
          filtered = filtered.filter(profile => 
            profile.categorias.some(cat => cat.nome === categoria.nome)
          );
        }
      }

      // Filtro por cidade
      if (selectedCidade !== "todas") {
        filtered = filtered.filter(profile => profile.cidade === selectedCidade);
      }
      
      setFilteredProfiles(filtered);
    };

    // Debounce para filtros de busca
    const timeoutId = setTimeout(applyFilters, searchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTipo, selectedCategoria, selectedCidade, profiles, categorias]);

  const gerarMensagemWhatsApp = (nome: string) => {
    return encodeURIComponent(`Olá ${nome}, vi seu perfil no Servix e gostaria de saber mais sobre seus serviços.`);
  };

  const handleWhatsAppClick = (profile: Profile) => {
    const whatsapp = profile.whatsapp || profile.telefone;
    const message = gerarMensagemWhatsApp(profile.nome);
    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTipo("todos");
    setSelectedCategoria("todas");
    setSelectedCidade("todas");
  };

  if (loading || navigating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {loading ? "Carregando profissionais..." : "Redirecionando..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user}
        navigating={navigating}
        onNavigation={handleNavigation}
        onLogout={handleLogout}
      />

      <HeroSection 
        navigating={navigating}
        onNavigation={handleNavigation}
      />

      <FilterSection
        searchTerm={searchTerm}
        selectedTipo={selectedTipo}
        selectedCategoria={selectedCategoria}
        selectedCidade={selectedCidade}
        categorias={categorias}
        cidades={cidades}
        onSearchTermChange={setSearchTerm}
        onTipoChange={setSelectedTipo}
        onCategoriaChange={setSelectedCategoria}
        onCidadeChange={setSelectedCidade}
      />

      <main className="container mx-auto px-4 py-8">
        <ProfessionalList
          profiles={filteredProfiles}
          navigating={navigating}
          onNavigation={handleNavigation}
          onWhatsAppClick={handleWhatsAppClick}
          onClearFilters={handleClearFilters}
        />
        <div className="mt-8 flex justify-center">
          <FeedbackButton />
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <span className="font-smooch font-normal">Servix</span> © 2025 - Powered by CodeJungle
        </div>
      </footer>
    </div>
  );
};

export default Index;
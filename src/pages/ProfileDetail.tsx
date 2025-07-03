import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Phone, User, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  nome: string;
  cidade: string;
  tipo_profissional: string;
  descricao: string;
  foto_perfil: string;
  whatsapp: string;
  telefone: string;
  visualizacoes: number;
  categorias: {
    nome: string;
  };
}

const ProfileDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
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
            visualizacoes,
            categorias (
              nome
            )
          `)
          .eq('id', id)
          .eq('ativo', true)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setProfile(data);
          // Incrementar visualizações
          await supabase
            .from('profiles')
            .update({ visualizacoes: data.visualizacoes + 1 })
            .eq('id', id);
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const gerarMensagemWhatsApp = (nome: string) => {
    return encodeURIComponent(`Olá ${nome}, vi seu perfil no FreelaFácil e gostaria de saber mais sobre seus serviços.`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Perfil não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            O perfil que você está procurando não existe ou não está mais disponível.
          </p>
          <Link to="/">
            <Button>Voltar para início</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">FreelaFácil</h1>
            <div className="w-20"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <CardContent className="p-8">
              {/* Header do perfil */}
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Foto de perfil */}
                <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center text-4xl font-semibold text-muted-foreground overflow-hidden flex-shrink-0">
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

                {/* Informações principais */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold mb-2">{profile.nome}</h1>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-lg text-muted-foreground">
                      {profile.categorias.nome}
                    </p>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.cidade}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span className="capitalize">{profile.tipo_profissional}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span>{profile.visualizacoes + 1} visualizações</span>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      size="lg"
                      className="flex-1"
                      onClick={() => {
                        const whatsapp = profile.whatsapp || profile.telefone;
                        const message = gerarMensagemWhatsApp(profile.nome);
                        window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Chamar no WhatsApp
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={() => {
                        const whatsapp = profile.whatsapp || profile.telefone;
                        window.open(`tel:${whatsapp}`, '_self');
                      }}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              {profile.descricao && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h2 className="text-xl font-semibold mb-4">Sobre mim</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.descricao}
                  </p>
                </div>
              )}

              {/* Informações de contato */}
              <div className="mt-8 pt-8 border-t border-border">
                <h2 className="text-xl font-semibold mb-4">Contato</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">WhatsApp</h3>
                    <p className="text-muted-foreground">
                      {profile.whatsapp || profile.telefone}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Telefone</h3>
                    <p className="text-muted-foreground">
                      {profile.telefone}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Localização</h3>
                    <p className="text-muted-foreground">
                      {profile.cidade}
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Categoria</h3>
                    <p className="text-muted-foreground">
                      {profile.categorias.nome}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action final */}
          <div className="mt-8 text-center">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">
                  Interessado nos serviços?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Entre em contato agora mesmo pelo WhatsApp
                </p>
                <Button 
                  size="lg"
                  onClick={() => {
                    const whatsapp = profile.whatsapp || profile.telefone;
                    const message = gerarMensagemWhatsApp(profile.nome);
                    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${message}`, '_blank');
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Entrar em contato
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
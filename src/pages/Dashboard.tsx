import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Switch } from "@/components/ui/switch";
import { User, LogOut, Eye, Edit, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Profile {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  cidade: string;
  tipo_profissional: string[];
  categoria_id: string;
  categoria_ids: string[];
  descricao: string;
  foto_perfil: string;
  ativo: boolean;
  visualizacoes: number;
}

interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Verificar autenticação e carregar dados
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Buscar perfil do usuário com suas categorias
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_categorias!inner (
            categoria_id
          )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
      } else {
        // Extrair IDs das categorias
        const categoria_ids = profileData.profile_categorias?.map(pc => pc.categoria_id) || [];
        setProfile({
          ...profileData,
          categoria_ids
        });
      }

      // Buscar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (categoriasError) {
        console.error('Erro ao buscar categorias:', categoriasError);
      } else {
        setCategorias(categoriasData || []);
      }

      setLoading(false);
    };

    checkAuth();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSaveProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);

    try {
      // Atualizar dados básicos do perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nome: profile.nome,
          telefone: profile.telefone,
          whatsapp: profile.whatsapp,
          cidade: profile.cidade,
          tipo_profissional: profile.tipo_profissional,
          categoria_id: profile.categoria_ids[0] || profile.categoria_id, // Manter compatibilidade
          descricao: profile.descricao,
          foto_perfil: profile.foto_perfil,
          ativo: profile.ativo,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Atualizar categorias
      if (profile.categoria_ids && profile.categoria_ids.length > 0) {
        // Remover categorias existentes
        await supabase
          .from('profile_categorias')
          .delete()
          .eq('profile_id', profile.id);

        // Inserir novas categorias
        const categoriasToInsert = profile.categoria_ids.map(categoria_id => ({
          profile_id: profile.id,
          categoria_id
        }));

        const { error: categoriasError } = await supabase
          .from('profile_categorias')
          .insert(categoriasToInsert);

        if (categoriasError) throw categoriasError;
      }

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });

      setEditMode(false);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const categoriasFiltradas = profile?.tipo_profissional && profile.tipo_profissional.length > 0
    ? categorias.filter(c => profile.tipo_profissional.includes(c.tipo_profissional))
    : [];

  const categoriasDoProfile = profile?.categoria_ids 
    ? categorias.filter(c => profile.categoria_ids.includes(c.id))
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Perfil não encontrado</CardTitle>
            <CardDescription>
              Houve um problema ao carregar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/auth')}>
              Voltar para login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <h1 className="text-2xl font-normal font-smooch text-foreground">Servix</h1>
              </Link>
              <span className="text-muted-foreground">Painel do Profissional</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/profile/${profile.id}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Perfil Público
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status do Perfil</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {profile.ativo ? 'Ativo' : 'Inativo'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.ativo ? 'Visível para clientes' : 'Oculto dos resultados'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile.visualizacoes}</div>
                <p className="text-xs text-muted-foreground">
                  Total de visualizações
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categoria</CardTitle>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {categoriasDoProfile.map(c => c.nome).join(', ') || 'N/A'}
                </div>
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile.tipo_profissional.join(', ')}
                    </p>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de edição */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Meu Perfil</CardTitle>
                    <CardDescription>
                      Gerencie suas informações profissionais
                    </CardDescription>
                  </div>
                  <Button
                    variant={editMode ? "destructive" : "default"}
                    onClick={() => editMode ? setEditMode(false) : setEditMode(true)}
                  >
                    {editMode ? "Cancelar" : "Editar"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={profile.nome}
                      onChange={(e) => setProfile({...profile, nome: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={profile.cidade}
                      onChange={(e) => setProfile({...profile, cidade: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={profile.telefone}
                      onChange={(e) => setProfile({...profile, telefone: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={profile.whatsapp}
                      onChange={(e) => setProfile({...profile, whatsapp: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de profissional</Label>
                    <ToggleGroup 
                      type="multiple"
                      value={profile.tipo_profissional} 
                      onValueChange={(value) => setProfile({...profile, tipo_profissional: value, categoria_id: ""})}
                      disabled={!editMode}
                      className="justify-start gap-2"
                    >
                      <ToggleGroupItem 
                        value="freelancer" 
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        Freelancer
                      </ToggleGroupItem>
                      <ToggleGroupItem 
                        value="prestador" 
                        className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                      >
                        Prestador de Serviço
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Especialidades</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3 bg-muted/20">
                      {categoriasFiltradas.map((categoria) => (
                        <label key={categoria.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={profile.categoria_ids?.includes(categoria.id) || false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const currentIds = profile.categoria_ids || [];
                              let newIds;
                              
                              if (isChecked) {
                                newIds = [...currentIds, categoria.id];
                              } else {
                                newIds = currentIds.filter(id => id !== categoria.id);
                              }
                              
                              setProfile({
                                ...profile, 
                                categoria_ids: newIds,
                                categoria_id: newIds[0] || '' // Manter compatibilidade
                              });
                            }}
                            disabled={!editMode}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{categoria.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={profile.descricao || ""}
                    onChange={(e) => setProfile({...profile, descricao: e.target.value})}
                    disabled={!editMode}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foto">URL da foto de perfil</Label>
                  <Input
                    id="foto"
                    type="url"
                    value={profile.foto_perfil || ""}
                    onChange={(e) => setProfile({...profile, foto_perfil: e.target.value})}
                    disabled={!editMode}
                  />
                </div>

                {editMode && (
                  <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Configurações */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
                <CardDescription>
                  Controle a visibilidade do seu perfil
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Perfil Ativo</Label>
                    <p className="text-sm text-muted-foreground">
                      Quando ativo, seu perfil aparece nas buscas
                    </p>
                  </div>
                  <Switch
                    checked={profile.ativo}
                    onCheckedChange={(checked) => {
                      setProfile({...profile, ativo: checked});
                      // Salvar automaticamente
                      if (user) {
                        supabase
                          .from('profiles')
                          .update({ ativo: checked })
                          .eq('user_id', user.id)
                          .then(({ error }) => {
                            if (error) {
                              toast({
                                title: "Erro",
                                description: "Não foi possível atualizar o status.",
                                variant: "destructive",
                              });
                            } else {
                              toast({
                                title: "Status atualizado",
                                description: `Perfil ${checked ? 'ativado' : 'desativado'} com sucesso.`,
                              });
                            }
                          });
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preview do perfil */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Preview do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-lg font-semibold text-muted-foreground overflow-hidden">
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
                    <h3 className="font-semibold truncate">{profile.nome}</h3>
                    <p className="text-sm text-muted-foreground">
                      {categoriasDoProfile.map(c => c.nome).join(', ') || 'Nenhuma categoria selecionada'}
                    </p>
                    <p className="text-xs text-muted-foreground">{profile.cidade}</p>
                  </div>
                </div>
                {profile.descricao && (
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3">
                    {profile.descricao}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
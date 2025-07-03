import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Edit, Save, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Categoria {
  id: string;
  nome: string;
  tipo_profissional: string;
}

interface ProfileData {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string | null;
  cidade: string;
  tipo_profissional: string;
  categoria_id: string;
  descricao: string | null;
  foto_perfil: string | null;
}

interface EditData extends Partial<ProfileData> {
  foto_perfil_file?: File | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<EditData>({});

  // Verificar autenticação e buscar dados
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Buscar perfil do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
      } else {
        setProfileData(profile);
        setEditData(profile);
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  // Buscar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .order('nome');

      if (!error) {
        setCategorias(data || []);
      }
    };

    fetchCategorias();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSave = async () => {
    if (!profileData) return;
    
    setSaving(true);
    
    try {
      let fotoUrl = editData.foto_perfil;
      
      // Upload da nova foto se foi selecionada
      if (editData.foto_perfil_file) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Usuário não autenticado');

        const fileExt = editData.foto_perfil_file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, editData.foto_perfil_file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        fotoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          nome: editData.nome,
          telefone: editData.telefone,
          whatsapp: editData.whatsapp,
          cidade: editData.cidade,
          tipo_profissional: editData.tipo_profissional,
          categoria_id: editData.categoria_id,
          descricao: editData.descricao,
          foto_perfil: fotoUrl,
        })
        .eq('id', profileData.id);

      if (error) throw error;

      setProfileData({ ...profileData, ...editData, foto_perfil: fotoUrl } as ProfileData);
      setEditData({ ...editData, foto_perfil: fotoUrl, foto_perfil_file: null });
      setEditing(false);
      
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas com sucesso.",
      });
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

  const categoriasFiltradas = editData.tipo_profissional 
    ? categorias.filter(c => c.tipo_profissional === editData.tipo_profissional)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Perfil não encontrado</CardTitle>
            <CardDescription>
              Não foi possível carregar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Início
            </Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              {profileData.foto_perfil ? (
                <img 
                  src={profileData.foto_perfil} 
                  alt={profileData.nome}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">{profileData.nome}</CardTitle>
            <CardDescription>
              {categorias.find(c => c.id === profileData.categoria_id)?.nome} • {profileData.cidade}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex justify-end">
              {editing ? (
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => {
                    setEditing(false);
                    setEditData(profileData);
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={editing ? editData.nome || '' : profileData.nome}
                  onChange={(e) => setEditData({...editData, nome: e.target.value})}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={editing ? editData.telefone || '' : profileData.telefone}
                  onChange={(e) => setEditData({...editData, telefone: e.target.value})}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={editing ? editData.whatsapp || '' : profileData.whatsapp || ''}
                  onChange={(e) => setEditData({...editData, whatsapp: e.target.value})}
                  disabled={!editing}
                  placeholder="Opcional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={editing ? editData.cidade || '' : profileData.cidade}
                  onChange={(e) => setEditData({...editData, cidade: e.target.value})}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de profissional</Label>
                <Select 
                  value={editing ? editData.tipo_profissional || '' : profileData.tipo_profissional}
                  onValueChange={(value) => setEditData({...editData, tipo_profissional: value, categoria_id: ''})}
                  disabled={!editing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="prestador">Prestador de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={editing ? editData.categoria_id || '' : profileData.categoria_id}
                  onValueChange={(value) => setEditData({...editData, categoria_id: value})}
                  disabled={!editing}
                >
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Foto de perfil</Label>
              {editing ? (
                <>
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setEditData({...editData, foto_perfil_file: file});
                    }}
                  />
                  {editData.foto_perfil_file && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {editData.foto_perfil_file.name}
                    </p>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {profileData.foto_perfil ? "Foto carregada" : "Nenhuma foto"}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={editing ? editData.descricao || '' : profileData.descricao || ''}
                onChange={(e) => setEditData({...editData, descricao: e.target.value})}
                disabled={!editing}
                placeholder="Conte sobre sua experiência e serviços..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
import { LogOut, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { PhotoUpload } from "@/components/profile/PhotoUpload";

const Profile = () => {
  const { toast } = useToast();
  const {
    loading,
    saving,
    setSaving,
    editing,
    setEditing,
    categorias,
    profileData,
    setProfileData,
    editData,
    setEditData,
    handleLogout,
  } = useProfileData();

  const {
    photoPreview,
    handlePhotoSelect,
    uploadPhoto,
    clearPhotoPreview,
  } = usePhotoUpload(editData, setEditData);

  const handleSave = async () => {
    if (!profileData) return;
    
    setSaving(true);
    
    try {
      const fotoUrl = await uploadPhoto();

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

      setProfileData({ ...profileData, ...editData, foto_perfil: fotoUrl } as any);
      setEditData({ ...editData, foto_perfil: fotoUrl, foto_perfil_file: null });
      clearPhotoPreview();
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

  const handleCancel = () => {
    setEditing(false);
    setEditData(profileData || {});
    clearPhotoPreview();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-pulse">
            Loading...
          </div>
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
            <Button onClick={() => window.location.href = '/'} className="w-full">
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
          <CardHeader>
            <ProfileHeader
              profileData={profileData}
              photoPreview={photoPreview}
              editing={editing}
              onPhotoSelect={handlePhotoSelect}
              categorias={categorias}
            />
          </CardHeader>

          <CardContent className="space-y-6">
            <ProfileActions
              editing={editing}
              saving={saving}
              profileData={profileData}
              onEdit={() => setEditing(true)}
              onCancel={handleCancel}
              onSave={handleSave}
            />

            <ProfileForm
              editing={editing}
              profileData={profileData}
              editData={editData}
              categorias={categorias}
              onDataChange={setEditData}
            />

            <PhotoUpload
              editing={editing}
              editData={editData}
              onPhotoSelect={handlePhotoSelect}
              hasExistingPhoto={!!profileData.foto_perfil}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
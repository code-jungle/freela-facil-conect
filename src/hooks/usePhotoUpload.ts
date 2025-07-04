import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { EditData } from "@/components/profile/types";

export const usePhotoUpload = (editData: EditData, setEditData: (data: EditData) => void) => {
  const { toast } = useToast();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoSelect = (file: File) => {
    setEditData({...editData, foto_perfil_file: file});
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!editData.foto_perfil_file) {
      return editData.foto_perfil;
    }

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

    return publicUrl;
  };

  const clearPhotoPreview = () => {
    setPhotoPreview(null);
  };

  return {
    photoPreview,
    handlePhotoSelect,
    uploadPhoto,
    clearPhotoPreview,
  };
};
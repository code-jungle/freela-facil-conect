import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileData, EditData, Categoria } from "@/components/profile/types";

export const useProfileData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<EditData>({});

  // Check authentication and fetch data
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Fetch user profile with categories
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          profile_categorias!inner (
            categoria_id
          )
        `)
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
      } else {
        // Transform data to include categoria_ids
        const categoria_ids = profile.profile_categorias?.map(pc => pc.categoria_id) || [];
        const profileWithCategories = {
          ...profile,
          categoria_ids
        };
        setProfileData(profileWithCategories);
        setEditData(profileWithCategories);
        
        // Check for pending photo from user metadata
        const hasPendingPhoto = session.user.user_metadata?.has_pending_photo === "true";
        if (hasPendingPhoto && !profile.foto_perfil) {
          toast({
            title: "Upload de foto pendente",
            description: "Você pode fazer upload da sua foto agora editando seu perfil.",
          });
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate, toast]);

  // Fetch categories
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi deslogado com sucesso.",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error logging out:', error);
      toast({
        title: "Erro no logout",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
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
  };
};
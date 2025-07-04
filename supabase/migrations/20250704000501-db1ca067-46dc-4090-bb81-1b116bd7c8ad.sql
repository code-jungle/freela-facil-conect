-- Criar perfil para usuário existente que não tem perfil
INSERT INTO public.profiles (
  user_id,
  nome,
  telefone,
  whatsapp,
  cidade,
  tipo_profissional,
  categoria_id,
  descricao,
  foto_perfil
)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'nome', 'Nome não informado'),
  COALESCE(u.raw_user_meta_data->>'telefone', ''),
  COALESCE(u.raw_user_meta_data->>'whatsapp', u.raw_user_meta_data->>'telefone', ''),
  COALESCE(u.raw_user_meta_data->>'cidade', ''),
  COALESCE(u.raw_user_meta_data->>'tipo_profissional', 'freelancer'),
  COALESCE((u.raw_user_meta_data->>'categoria_id')::uuid, (SELECT id FROM public.categorias LIMIT 1)),
  COALESCE(u.raw_user_meta_data->>'descricao', ''),
  COALESCE(u.raw_user_meta_data->>'foto_perfil', '')
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;
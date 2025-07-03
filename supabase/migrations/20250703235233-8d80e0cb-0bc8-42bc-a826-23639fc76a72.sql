-- Criar função para automaticamente criar perfil quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    NEW.raw_user_meta_data->>'telefone',
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', NEW.raw_user_meta_data->>'telefone'),
    NEW.raw_user_meta_data->>'cidade',
    NEW.raw_user_meta_data->>'tipo_profissional',
    (NEW.raw_user_meta_data->>'categoria_id')::uuid,
    NEW.raw_user_meta_data->>'descricao',
    NEW.raw_user_meta_data->>'foto_perfil'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para chamar a função quando um usuário é criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
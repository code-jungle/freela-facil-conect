-- Verificar se o trigger existe e recriá-lo se necessário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar a função com melhor tratamento de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'Trigger executado para usuário: %', NEW.id;
  
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
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Nome não informado'),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp', NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cidade', ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo_profissional', 'freelancer'),
    COALESCE((NEW.raw_user_meta_data->>'categoria_id')::uuid, (SELECT id FROM public.categorias LIMIT 1)),
    COALESCE(NEW.raw_user_meta_data->>'descricao', ''),
    COALESCE(NEW.raw_user_meta_data->>'foto_perfil', '')
  );
  
  RAISE LOG 'Perfil criado com sucesso para usuário: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Não falhar o cadastro se der erro no perfil
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
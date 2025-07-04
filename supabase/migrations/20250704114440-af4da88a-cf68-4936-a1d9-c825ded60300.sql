-- Melhorar o trigger de criação de perfil com melhor tratamento de erros
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar a função com validações mais robustas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_categoria_id UUID;
BEGIN
  -- Log detalhado para debug
  RAISE LOG 'Trigger executado para usuário: % com dados: %', NEW.id, NEW.raw_user_meta_data;
  
  -- Buscar uma categoria padrão que existe
  SELECT id INTO default_categoria_id 
  FROM public.categorias 
  WHERE tipo_profissional = COALESCE(NEW.raw_user_meta_data->>'tipo_profissional', 'freelancer')
  LIMIT 1;
  
  -- Se não encontrou categoria específica, pegar qualquer uma
  IF default_categoria_id IS NULL THEN
    SELECT id INTO default_categoria_id FROM public.categorias LIMIT 1;
  END IF;
  
  -- Validar se temos categoria válida
  IF default_categoria_id IS NULL THEN
    RAISE LOG 'ERRO: Nenhuma categoria encontrada no sistema';
    RETURN NEW; -- Não falhar o cadastro
  END IF;
  
  -- Validar categoria_id se fornecida
  IF NEW.raw_user_meta_data->>'categoria_id' IS NOT NULL THEN
    -- Verificar se a categoria existe e é do tipo correto
    IF NOT EXISTS (
      SELECT 1 FROM public.categorias 
      WHERE id = (NEW.raw_user_meta_data->>'categoria_id')::uuid 
      AND tipo_profissional = COALESCE(NEW.raw_user_meta_data->>'tipo_profissional', 'freelancer')
    ) THEN
      RAISE LOG 'Categoria inválida fornecida, usando padrão: %', default_categoria_id;
    ELSE
      default_categoria_id := (NEW.raw_user_meta_data->>'categoria_id')::uuid;
    END IF;
  END IF;
  
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
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'nome'), ''), 'Usuário'),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'telefone'), ''), ''),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'whatsapp'), ''), 
      NULLIF(TRIM(NEW.raw_user_meta_data->>'telefone'), ''), 
      ''
    ),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'cidade'), ''), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'tipo_profissional'), ''), 'freelancer'),
    default_categoria_id,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'descricao'), ''), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_perfil'), ''), '')
  );
  
  RAISE LOG 'Perfil criado com sucesso para usuário: % com categoria: %', NEW.id, default_categoria_id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'ERRO ao criar perfil para usuário %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW; -- Não falhar o cadastro mesmo com erro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
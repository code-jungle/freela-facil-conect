-- Alterar tipo_profissional para permitir múltiplos valores
ALTER TABLE public.profiles 
ALTER COLUMN tipo_profissional TYPE text[] USING ARRAY[tipo_profissional];

-- Atualizar a função handle_new_user para trabalhar com arrays
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  default_categoria_id UUID;
  user_tipos text[];
BEGIN
  -- Log detalhado para debug
  RAISE LOG 'Trigger executado para usuário: % com dados: %', NEW.id, NEW.raw_user_meta_data;
  
  -- Converter tipo_profissional para array se for string
  IF NEW.raw_user_meta_data->>'tipo_profissional' IS NOT NULL THEN
    -- Se já é um array JSON, converter
    IF jsonb_typeof(NEW.raw_user_meta_data->'tipo_profissional') = 'array' THEN
      SELECT array_agg(value#>>'{}') INTO user_tipos 
      FROM jsonb_array_elements(NEW.raw_user_meta_data->'tipo_profissional');
    ELSE
      -- Se é string, criar array
      user_tipos := ARRAY[NEW.raw_user_meta_data->>'tipo_profissional'];
    END IF;
  ELSE
    user_tipos := ARRAY['freelancer'];
  END IF;
  
  -- Buscar uma categoria padrão que existe para um dos tipos
  SELECT id INTO default_categoria_id 
  FROM public.categorias 
  WHERE tipo_profissional = ANY(user_tipos)
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
    -- Verificar se a categoria existe e é de um dos tipos selecionados
    IF NOT EXISTS (
      SELECT 1 FROM public.categorias 
      WHERE id = (NEW.raw_user_meta_data->>'categoria_id')::uuid 
      AND tipo_profissional = ANY(user_tipos)
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
    user_tipos,
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
$function$;
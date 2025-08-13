-- Criar tabela de relacionamento many-to-many entre profiles e categorias
CREATE TABLE public.profile_categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, categoria_id)
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.profile_categorias ENABLE ROW LEVEL SECURITY;

-- Criar políticas para a tabela profile_categorias
CREATE POLICY "Usuários podem ver suas próprias categorias" 
ON public.profile_categorias 
FOR SELECT 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem inserir suas próprias categorias" 
ON public.profile_categorias 
FOR INSERT 
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar suas próprias categorias" 
ON public.profile_categorias 
FOR UPDATE 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar suas próprias categorias" 
ON public.profile_categorias 
FOR DELETE 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- Política para visualização pública (perfis ativos)
CREATE POLICY "Categorias de perfis ativos são visíveis para todos" 
ON public.profile_categorias 
FOR SELECT 
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE ativo = true
  )
);

-- Migrar dados existentes para a nova tabela
INSERT INTO public.profile_categorias (profile_id, categoria_id)
SELECT id, categoria_id 
FROM public.profiles 
WHERE categoria_id IS NOT NULL;

-- Atualizar a função handle_new_user para trabalhar com múltiplas categorias
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  default_categoria_id UUID;
  user_tipos text[];
  new_profile_id UUID;
  categoria_ids text[];
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

  -- Processar categoria_id(s)
  IF NEW.raw_user_meta_data->>'categoria_ids' IS NOT NULL THEN
    -- Se há múltiplas categorias
    IF jsonb_typeof(NEW.raw_user_meta_data->'categoria_ids') = 'array' THEN
      SELECT array_agg(value#>>'{}') INTO categoria_ids 
      FROM jsonb_array_elements(NEW.raw_user_meta_data->'categoria_ids');
    ELSE
      categoria_ids := ARRAY[NEW.raw_user_meta_data->>'categoria_ids'];
    END IF;
  ELSIF NEW.raw_user_meta_data->>'categoria_id' IS NOT NULL THEN
    -- Compatibilidade com categoria única
    categoria_ids := ARRAY[NEW.raw_user_meta_data->>'categoria_id'];
  END IF;

  -- Se não há categorias válidas, buscar uma padrão
  IF categoria_ids IS NULL OR array_length(categoria_ids, 1) = 0 THEN
    SELECT id INTO default_categoria_id 
    FROM public.categorias 
    WHERE tipo_profissional = ANY(user_tipos)
    LIMIT 1;
    
    IF default_categoria_id IS NULL THEN
      SELECT id INTO default_categoria_id FROM public.categorias LIMIT 1;
    END IF;
    
    IF default_categoria_id IS NOT NULL THEN
      categoria_ids := ARRAY[default_categoria_id::text];
    END IF;
  END IF;
  
  -- Inserir perfil
  INSERT INTO public.profiles (
    user_id,
    nome,
    telefone,
    whatsapp,
    cidade,
    tipo_profissional,
    categoria_id, -- Manter por compatibilidade
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
    categoria_ids[1]::uuid, -- Primeira categoria para compatibilidade
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'descricao'), ''), ''),
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'foto_perfil'), ''), '')
  )
  RETURNING id INTO new_profile_id;

  -- Inserir relacionamentos de categorias
  IF categoria_ids IS NOT NULL AND array_length(categoria_ids, 1) > 0 THEN
    FOR i IN 1..array_length(categoria_ids, 1) LOOP
      INSERT INTO public.profile_categorias (profile_id, categoria_id)
      VALUES (new_profile_id, categoria_ids[i]::uuid)
      ON CONFLICT (profile_id, categoria_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RAISE LOG 'Perfil criado com sucesso para usuário: % com categorias: %', NEW.id, categoria_ids;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'ERRO ao criar perfil para usuário %: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW; -- Não falhar o cadastro mesmo com erro
END;
$function$;
-- Criar tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  tipo_profissional TEXT NOT NULL CHECK (tipo_profissional IN ('freelancer', 'prestador')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de profissionais
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  cidade TEXT NOT NULL,
  tipo_profissional TEXT NOT NULL CHECK (tipo_profissional IN ('freelancer', 'prestador')),
  categoria_id UUID REFERENCES public.categorias(id) NOT NULL,
  descricao TEXT,
  foto_perfil TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  visualizacoes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (público para leitura)
CREATE POLICY "Categorias são visíveis para todos" 
ON public.categorias 
FOR SELECT 
USING (true);

-- Políticas para profiles (leitura pública para perfis ativos, edição apenas pelo próprio usuário)
CREATE POLICY "Perfis ativos são visíveis para todos" 
ON public.profiles 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Usuários podem ver seus próprios perfis" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios perfis" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios perfis" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias iniciais
INSERT INTO public.categorias (nome, tipo_profissional) VALUES
-- Freelancers
('Designer Gráfico', 'freelancer'),
('Desenvolvedor Web', 'freelancer'),
('Redator', 'freelancer'),
('Tradutor', 'freelancer'),
('Fotógrafo', 'freelancer'),
('Editor de Vídeo', 'freelancer'),
('Social Media', 'freelancer'),
('Consultor', 'freelancer'),
-- Prestadores de Serviço
('Garçom', 'prestador'),
('Entregador', 'prestador'),
('Pintor', 'prestador'),
('Pedreiro', 'prestador'),
('Encanador', 'prestador'),
('Eletricista', 'prestador'),
('Jardineiro', 'prestador'),
('Faxineira', 'prestador'),
('Mecânico', 'prestador'),
('Cabeleireiro', 'prestador'),
('Manicure', 'prestador'),
('Cozinheiro', 'prestador'),
('Segurança', 'prestador'),
('Motorista', 'prestador'),
('Montador de Móveis', 'prestador'),
('Técnico em Informática', 'prestador');
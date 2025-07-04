-- Desabilitar confirmação de email
UPDATE auth.config 
SET value = 'false' 
WHERE parameter = 'enable_signup';

-- Permitir signup sem confirmação de email
UPDATE auth.config 
SET value = 'false' 
WHERE parameter = 'enable_email_confirmations';

-- Inserir configuração se não existir
INSERT INTO auth.config (parameter, value) 
VALUES ('enable_email_confirmations', 'false') 
ON CONFLICT (parameter) DO UPDATE SET value = 'false';

-- Habilitar signup novamente
INSERT INTO auth.config (parameter, value) 
VALUES ('enable_signup', 'true') 
ON CONFLICT (parameter) DO UPDATE SET value = 'true';
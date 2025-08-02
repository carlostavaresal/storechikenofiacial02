
-- Inserir um usuário administrativo temporário na tabela auth.users
-- IMPORTANTE: Este é um método temporário apenas para desenvolvimento
-- Em produção, use o painel do Supabase ou a API de admin

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@sistema.com',
    crypt('admin1234', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Confirmar o email automaticamente para o usuário admin
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_token = ''
WHERE email = 'admin@sistema.com';

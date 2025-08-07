
-- Primeiro, remover qualquer usuário existente com emails conflitantes
DELETE FROM auth.users WHERE email IN ('admin@sistema.com', 'romenia12@sistema.com');

-- Criar o usuário administrador com as credenciais corretas
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
    'romenia12',
    crypt('romenia12', gen_salt('bf')),
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

-- Garantir que o email está confirmado
UPDATE auth.users 
SET 
    email_confirmed_at = NOW(),
    confirmation_token = '',
    email_change = '',
    email_change_token_new = '',
    recovery_token = ''
WHERE email = 'romenia12';

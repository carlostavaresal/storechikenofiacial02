
-- Atualizar as credenciais do usuário admin existente
UPDATE auth.users 
SET 
    email = 'romenia12@sistema.com',
    encrypted_password = crypt('romenia12', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'admin@sistema.com';

-- Se não existir usuário com o email antigo, criar um novo
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
)
SELECT 
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'romenia12@sistema.com',
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
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@sistema.com'
);

-- Confirmar o email para o novo usuário
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    confirmation_token = ''
WHERE email = 'romenia12@sistema.com';

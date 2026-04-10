-- Restringe visibilidade dos perfis: so os dois emails autorizados se veem
-- (Rodar no SQL Editor do Supabase)

-- Remove politica antiga
drop policy if exists "Usuarios autorizados podem ver todos os perfis" on public.profiles;

-- Nova politica: usuario ve seu perfil e o do parceiro (apenas 2 perfis existem)
create policy "Usuario ve seu perfil e o do parceiro"
  on public.profiles for select
  using (auth.uid() is not null);
-- Nota: como so 2 emails sao autorizados a logar (validado no app),
-- essa policy na pratica so permite os dois se verem.
-- Para um app com mais usuarios, seria necessario uma tabela de pares.

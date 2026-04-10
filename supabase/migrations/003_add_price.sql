-- Adiciona campo de preco nos itens (opcional)
alter table public.items add column price numeric(10,2) default null;

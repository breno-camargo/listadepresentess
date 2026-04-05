# Lista de Presentes - Wishlist de Casal

## Resumo

App de wishlist para casal. Cada pessoa loga com Google, cria sua lista de desejos (nome, link, categoria, favorito), e o parceiro visualiza. A dona da lista pode marcar itens como "comprado", visivel para ambos.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript
- **Backend:** Next.js API Routes / Server Actions
- **Banco de dados:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth com Google OAuth
- **Hospedagem:** Vercel
- **Design:** Mobile-first, tema fofo/romantico (tons pasteis)

## Usuarios

- Dois usuarios fixos, autorizados por email
- Login via Google OAuth (Supabase Auth)
- Qualquer outro email que tente logar e rejeitado
- Cada usuario tem: id, email, name, avatarUrl (do Google)

## Modelo de Dados

### User

| Campo     | Tipo   | Descricao                  |
|-----------|--------|----------------------------|
| id        | uuid   | PK, do Supabase Auth       |
| email     | string | Email do Google             |
| name      | string | Nome do Google              |
| avatarUrl | string | Foto de perfil do Google    |
| createdAt | timestamp | Data de criacao           |

### Category

| Campo     | Tipo   | Descricao                  |
|-----------|--------|----------------------------|
| id        | uuid   | PK                         |
| userId    | uuid   | FK para User (dono)        |
| name      | string | Nome da categoria          |
| createdAt | timestamp | Data de criacao           |

### Item

| Campo      | Tipo    | Descricao                    |
|------------|---------|------------------------------|
| id         | uuid    | PK                           |
| userId     | uuid    | FK para User (dono da lista) |
| categoryId | uuid    | FK para Category (opcional)  |
| name       | string  | Nome do produto              |
| url        | string  | Link do produto (opcional)   |
| isFavorite | boolean | Marcado como favorito        |
| isPurchased| boolean | Marcado como comprado        |
| createdAt  | timestamp | Data de criacao             |

## Funcionalidades

### Autenticacao

- Login com Google via Supabase Auth
- Apenas dois emails autorizados conseguem acessar
- Sessao persistente (nao precisa logar toda vez)

### Minha Lista (aba editavel)

- Adicionar item: nome (obrigatorio), link (opcional), categoria (opcional)
- Editar item: nome, link, categoria
- Remover item
- Marcar/desmarcar como favorito (coracao)
- Marcar como comprado (item fica riscado, opacidade reduzida, vai pro final)
- Criar/gerenciar categorias proprias

### Lista do Parceiro (aba somente leitura)

- Visualizar todos os itens do parceiro
- Filtrar por categoria
- Favoritos destacados (icone de coracao, borda diferenciada)
- Itens comprados aparecem riscados no final
- Link clicavel abre em nova aba

### Navegacao

- Duas abas no topo: "Minha Lista" e "Lista dele/dela"
- Botao flutuante (FAB) para adicionar item (visivel apenas na "Minha Lista")

## Design Visual

### Paleta

- Fundo: branco / rosa bem claro (#FFF5F7)
- Primaria: rosa (#F472B6)
- Secundaria: lilas claro (#E9D5FF)
- Texto: cinza escuro (#374151)
- Acentos: rosa forte (#EC4899)

### Tipografia

- Fonte principal: Nunito ou Poppins (arredondada, amigavel)
- Tamanhos otimizados para mobile

### Componentes

- **Cards de item:** cantos arredondados (12px), sombra suave, padding generoso para toque
- **Favoritos:** icone de coracao preenchido em rosa, card com borda rosa
- **Comprados:** texto riscado, opacidade 50%, agrupados no final da lista
- **Categorias:** chips/tags coloridos acima da lista para filtro
- **FAB:** botao circular rosa no canto inferior direito com icone de "+"
- **Abas:** toggle suave no topo com indicador animado

### Responsividade

- **Mobile-first:** otimizado para telas de celular
- **Desktop:** layout centralizado com max-width, mantendo a mesma experiencia
- Alvos de toque minimo 44x44px
- Inputs e botoes com tamanho confortavel para uso com o polegar

## Seguranca

- Row Level Security (RLS) no Supabase: cada usuario so edita seus proprios itens e categorias
- Leitura cruzada permitida apenas entre os dois usuarios autorizados
- Emails autorizados configurados como variavel de ambiente

## Fora do Escopo

- Notificacoes push
- Upload de imagens
- Compartilhamento publico da lista
- Mais de dois usuarios

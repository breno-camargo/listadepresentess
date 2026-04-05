export interface Profile {
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Item {
  id: string
  user_id: string
  category_id: string | null
  name: string
  url: string | null
  is_favorite: boolean
  is_purchased: boolean
  created_at: string
  category?: Category
}

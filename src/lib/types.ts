// Types pour l'application

export type UserRole = 'vendeur' | 'technicien' | 'gestionnaire_stock' | 'super_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  updated_at?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Flux {
  id: string;
  created_at: string;
  updated_at?: string;
  client_name: string;
  client_email?: string;
  client_phone: string;
  address: string;
  city: string;
  post_code: string;
  type_flux: 'Commande' | 'Installation' | 'Location' | string;
  game_model?: string;
  state?: string;
  details?: string;
  assignee_id?: string;
  assignee_email?: string;
  created_by?: string;
}

// Types pour la base de données (simulé)
export namespace Database {
  export namespace public {
    export namespace Tables {
      export interface flux {
        Row: Flux;
      }
      
      export interface users {
        Row: User;
      }
    }
  }
}
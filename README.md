# MaConsolePro Dashboard

Une interface de gestion des flux pour MaConsolePro - Dashboard amélioré pour la gestion des commandes, installations et locations.

## Fonctionnalités

- Vue d'ensemble avec cartes pour Commandes, Installations, Locations et Rappels
- Tableau de données compact pour afficher tous les flux (commandes, installations, locations)
- Actions contextuelles selon le rôle de l'utilisateur (Vendeur, Technicien, Gestionnaire de stock)
- Panneau latéral détaillé qui s'ouvre lors de la sélection d'un flux
- Thème sombre moderne

## Captures d'écran

Dashboard principal avec les statuts des flux:
- Cartes avec compteurs de progrès (terminés/total)
- Tableau interactif avec menu d'actions
- Panneau de détails sur la droite

## Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase (base de données et authentification)

## Rôles utilisateurs

- **Vendeur:** Point d'entrée unique pour toutes les demandes
- **Technicien:** Traite les installations de jeux
- **Gestionnaire de stock:** Traite les commandes et locations
- **Super administrateur:** Supervise toutes les opérations

## États des flux

- **Traité / Non traité:** État final défini par le vendeur
- **Traitée et transmise au vendeur / Non traitée et transmise au vendeur:** États intermédiaires
- **Planifier:** Reporte la tâche à une date spécifique
- **Rappel:** Client indisponible, rappel automatique après 2h
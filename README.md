# 🕯️ Medicandle - Back Office

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

> Application de gestion complète pour une marque de bougies artisanales haut de gamme.

## ✨ Fonctionnalités Clés

Une suite d'outils puissants pour gérer l'ensemble du cycle de vie de production et de vente.

### 📊 Dashboard & Analytics
- **KPIs en temps réel** : Suivi du chiffre d'affaires, des commandes et de la production.
- **Graphiques interactifs** : Visualisation des ventes par période, collection et statut.
- **Alertes intelligentes** : Notifications de stock bas et de réapprovisionnement nécessaire.

### 🕯️ Gestion des Produits
- **Fiches Bougies Détaillées** : Gestion multi-onglets (Informations, Recette, Production, Prix).
- **Calculs Automatiques** :
  - Coût de revient précis (matières premières + main d'œuvre + charges).
  - Suggestions de prix de vente basées sur le positionnement (Entrée, Premium, Luxe).
  - Calcul des marges en temps réel.

### 📦 Stocks & Matières Premières
- **Inventaire Centralisé** : Suivi précis des cires, parfums, mèches et contenants.
- **Conversion d'Unités** : Gestion intelligente des unités (g, kg, L, ml, pièces).
- **Fournisseurs** : Base de données fournisseurs et historique des coûts.

### 💰 Finance & Projections
- **Scénarios Prévisionnels** : Simulation de chiffre d'affaires basée sur des hypothèses de vente.
- **Analyses de Rentabilité** : Identification des produits les plus performants.
- **Exports PDF** : Génération de fiches techniques et de rapports.

## 🛠️ Stack Technique

Construit avec les dernières technologies pour performance et fiabilité.

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Base de Données** : [PostgreSQL](https://www.postgresql.org/)
- **ORM** : [Prisma 7](https://www.prisma.io/)
- **Authentification** : [NextAuth.js v5](https://authjs.dev/)
- **Interface** : [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Visualisation** : [Recharts](https://recharts.org/)

## 🚀 Installation

### Prérequis

- Node.js 18+
- Docker (pour la base de données locale)

### Démarrage Rapide

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/votre-username/medicandle.git
    cd medicandle
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configurer l'environnement**
    Copiez le fichier d'exemple et remplissez vos variables :
    ```bash
    cp .env.example .env
    ```

4.  **Lancer l'environnement de développement**
    Utilisez la commande simplifiée pour tout démarrer (DB + App) :
    ```bash
    make quick-start
    ```

L'application sera accessible sur `http://localhost:3000`.

## 🔐 Variables d'Environnement

Les variables suivantes sont nécessaires au bon fonctionnement de l'application :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL |
| `AUTH_SECRET` | Clé secrète pour signer les sessions (générer avec `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL de l'application (ex: `http://localhost:3000`) |

## 📄 Licence

© 2025 Medicandle. Tous droits réservés.
Projet privé - Usage interne uniquement.

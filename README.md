# Medicandle - Back Office

Application de gestion pour une marque de bougies artisanales haut de gamme.

## 🚀 Démarrage rapide

### Première installation

```bash
# Setup complet (installe tout et démarre la DB)
make setup

# Démarrer le serveur
make dev
```

L'application sera disponible sur **http://localhost:3000**

### Identifiants par défaut

- **Email**: `admin@medicandle.com`
- **Mot de passe**: `admin123`

## 📋 Commandes Makefile

### Commandes principales

```bash
make help           # Afficher toutes les commandes disponibles
make setup          # Setup complet du projet (première fois)
make dev            # Lancer le serveur de développement
make quick-start    # DB + dev server (démarrage rapide quotidien)
```

### Base de données

```bash
make db-start       # Démarrer PostgreSQL
make db-stop        # Arrêter PostgreSQL
make db-clean       # Supprimer la base et les volumes
make db-logs        # Voir les logs PostgreSQL
make status         # Status des conteneurs Docker
```

### Prisma

```bash
make prisma-generate       # Générer le client Prisma
make prisma-migrate        # Créer/appliquer migrations
make prisma-seed           # Seed la base avec données initiales
make prisma-studio         # Ouvrir Prisma Studio (GUI)
make prisma-reset          # Reset complet (⚠️ supprime tout)
```

### Utilitaires

```bash
make build          # Build pour production
make start          # Démarrer en mode production
make lint           # Lancer le linter
make clean          # Nettoyage complet
make quick-reset    # Reset rapide de la DB
```

## 🏗️ Architecture

```
medicandle/
├── app/
│   ├── (public)/           # Site vitrine public
│   ├── (admin)/bo/         # Back-office protégé
│   ├── api/auth/           # API NextAuth
│   └── login/              # Page de connexion
├── components/
│   ├── admin/              # Composants back-office
│   │   ├── candles/
│   │   ├── materials/
│   │   ├── projections/
│   │   └── settings/
│   └── ui/                 # Shadcn UI components
├── lib/
│   ├── business/           # Logique métier
│   │   ├── materials.ts    # Calculs matières
│   │   ├── production.ts   # Calculs production
│   │   ├── pricing.ts      # Calculs prix/marges
│   │   └── projections.ts  # Calculs CA
│   └── prisma.ts           # Client Prisma
├── prisma/
│   ├── schema.prisma       # Schéma de base
│   ├── seed.ts             # Données initiales
│   └── migrations/
└── docker-compose.yml      # PostgreSQL config
```

## ✨ Fonctionnalités

### ✅ Modules implémentés

- **Authentification** - NextAuth.js avec protection routes
- **Dashboard** - KPIs, alertes stock, actions rapides
- **Matières premières** - CRUD complet avec gestion stock
- **Paramètres** - Production (taux horaire, électricité) & Pricing (multiplicateurs)
- **Bougies** - Gestion complète avec :
  - Formulaire multi-onglets (info, recette, production, prix)
  - Calculs automatiques des coûts (matières + production)
  - Simulation de prix selon positionnement
  - Export PDF des fiches produit
- **Projections** - Scénarios prévisionnels avec :
  - Simulation rapide de CA
  - Gestion multi-produits
  - Graphiques de répartition (Recharts)

### 🎯 Calculs automatiques

- **Coûts matières** avec conversions d'unités (g, kg, ml, L)
- **Coûts production** (temps × taux horaire + électricité)
- **Prix suggérés** selon positionnement (entrée/premium/luxe)
- **Marges en temps réel** avec code couleur

## 🛠️ Stack technique

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Base de données**: PostgreSQL 16 (Docker)
- **ORM**: Prisma 7
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS + Shadcn UI
- **Charts**: Recharts
- **PDF**: jsPDF
- **Langue**: TypeScript

## 📦 Structure de la base

**Modèles principaux** :
- `User` - Utilisateurs admin
- `Material` - Matières premières (cire, parfums, mèches, contenants...)
- `Candle` - Produits bougies
- `CandleMaterial` - Recettes (many-to-many)
- `CandleProductionParams` - Temps de production
- `ProductionSettings` - Paramètres globaux production
- `PricingSettings` - Paramètres globaux prix
- `ProjectionScenario` - Scénarios prévisionnels
- `ScenarioItem` - Items de projection

## 🔧 Variables d'environnement

Créer un fichier `.env` :

```env
DATABASE_URL="postgresql://postgres:password@localhost:5433/medicandle?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 📝 Développement

### Workflow quotidien

```bash
# 1. Démarrer la DB et le serveur
make quick-start

# 2. Travailler sur le code...

# 3. Si besoin de régénérer le client Prisma
make prisma-generate

# 4. Si besoin de reset la DB
make quick-reset
```

### Ajouter des dépendances

```bash
# Installer un package
npm install package-name

# Ajouter un composant Shadcn
npx shadcn@latest add component-name
```

### Prisma Studio

Pour visualiser et éditer la base graphiquement :

```bash
make prisma-studio
```

Ouvre automatiquement sur **http://localhost:51212**

## 🚢 Déploiement

```bash
# Build de production
make build

# Démarrer en production
make start
```

## 📄 License

Private - Usage interne uniquement

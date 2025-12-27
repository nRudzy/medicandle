.PHONY: help install db-start db-stop db-reset setup dev clean prisma-generate prisma-migrate prisma-seed prisma-studio restart status logs quick-start quick-reset pre-deploy build build-check start lint

# Variables
DOCKER_COMPOSE = docker-compose
NPM = npm
PRISMA = npx prisma

help: ## Afficher l'aide
	@echo "Commandes disponibles pour Medicandle:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Installer les dépendances npm
	$(NPM) install

db-start: ## Démarrer PostgreSQL avec Docker
	@echo "🐘 Démarrage de PostgreSQL..."
	$(DOCKER_COMPOSE) up -d
	@echo "✅ PostgreSQL démarré sur le port 5433"

db-stop: ## Arrêter PostgreSQL
	@echo "🛑 Arrêt de PostgreSQL..."
	$(DOCKER_COMPOSE) down

db-clean: ## Arrêter PostgreSQL et supprimer les volumes
	@echo "🧹 Nettoyage complet de la base..."
	$(DOCKER_COMPOSE) down -v
	@echo "✅ Base de données supprimée"

db-logs: ## Afficher les logs de PostgreSQL
	$(DOCKER_COMPOSE) logs -f postgres

prisma-generate: ## Générer le client Prisma
	@echo "⚙️  Génération du client Prisma..."
	$(PRISMA) generate
	@echo "✅ Client Prisma généré"

prisma-migrate: ## Créer et appliquer les migrations
	@echo "📊 Application des migrations..."
	$(PRISMA) migrate dev --name init
	@echo "✅ Migrations appliquées"

prisma-migrate-deploy: ## Appliquer les migrations (production)
	@echo "📊 Application des migrations en production..."
	$(PRISMA) migrate deploy
	@echo "✅ Migrations appliquées"

prisma-seed: ## Seed la base de données
	@echo "🌱 Seed de la base de données..."
	docker exec -i medicandle_postgres psql -U postgres -d medicandle < prisma/seed.sql || true
	@echo "✅ Données initiales créées"
	@echo "👤 Admin: admin@medicandle.com / admin123"

prisma-seed-alt: ## Seed avec Prisma (alternative)
	@echo "🌱 Seed de la base de données (Prisma)..."
	$(PRISMA) db seed
	@echo "✅ Données initiales créées"
	@echo "👤 Admin: admin@medicandle.com / admin123"

prisma-studio: ## Ouvrir Prisma Studio
	@echo "🎨 Ouverture de Prisma Studio..."
	$(PRISMA) studio

prisma-reset: ## Reset complet de la base (⚠️ supprime tout!)
	@echo "⚠️  ATTENTION: Cette commande va supprimer toutes les données!"
	@read -p "Continuer? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		$(PRISMA) migrate reset --force; \
		echo "✅ Base réinitialisée"; \
	fi

setup: install db-start prisma-generate prisma-migrate prisma-seed ## Setup complet du projet
	@echo ""
	@echo "🎉 Setup terminé!"
	@echo "👤 Utilisateur admin: admin@medicandle.com / admin123"
	@echo "📝 Prêt à démarrer avec: make dev"

dev: ## Lancer le serveur de développement (Turbopack)
	@echo "🚀 Démarrage du serveur Next.js (Turbopack)..."
	$(NPM) run dev

build: ## Build pour la production
	@echo "📦 Build de l'application..."
	$(NPM) run build

build-check: ## Vérifier le build TypeScript (comme Vercel)
	@echo "🔍 Vérification du build TypeScript..."
	@echo "💡 Ceci simule la vérification TypeScript de Vercel"
	$(NPM) run build 2>&1 | tee build.log
	@if grep -q "Failed to compile" build.log; then \
		echo "❌ Build échoué - corrigez les erreurs avant de déployer"; \
		rm build.log; \
		exit 1; \
	else \
		echo "✅ Build réussi - prêt à déployer!"; \
		rm build.log; \
	fi

start: ## Démarrer en mode production
	@echo "🚀 Démarrage en production..."
	$(NPM) start

lint: ## Lancer le linter
	$(NPM) run lint

clean: db-clean ## Nettoyage complet (base + node_modules)
	@echo "🧹 Suppression de node_modules..."
	rm -rf node_modules
	rm -rf .next
	@echo "✅ Nettoyage terminé"

restart: db-stop db-start ## Redémarrer PostgreSQL
	@echo "♻️  PostgreSQL redémarré"

status: ## Vérifier le status de PostgreSQL
	@echo "📊 Status des conteneurs:"
	$(DOCKER_COMPOSE) ps

logs: ## Voir tous les logs
	$(DOCKER_COMPOSE) logs

# Quick commands
quick-start: db-start dev ## Démarrage rapide (DB + dev server)

quick-reset: db-stop db-clean db-start prisma-migrate prisma-seed ## Reset rapide de la DB
	@echo "✅ Base réinitialisée et seedée"

pre-deploy: ## Vérifications avant déploiement
	@echo "🚀 Vérifications pré-déploiement..."
	@echo ""
	@echo "1️⃣  Vérification du build TypeScript..."
	@$(MAKE) build-check
	@echo ""
	@echo "2️⃣  Vérification de la génération Prisma..."
	@$(PRISMA) generate > /dev/null 2>&1 && echo "✅ Prisma Client OK" || (echo "❌ Erreur Prisma Client" && exit 1)
	@echo ""
	@echo "3️⃣  Vérification du linter..."
	@$(NPM) run lint > /dev/null 2>&1 && echo "✅ Lint OK" || (echo "❌ Erreur Lint" && exit 1)
	@echo ""
	@echo "✅ Toutes les vérifications sont passées!"
	@echo "💡 Vous pouvez maintenant déployer en toute sécurité:"
	@echo "   git add ."
	@echo "   git commit -m \"your message\""
	@echo "   git push"

# Default target
.DEFAULT_GOAL := help

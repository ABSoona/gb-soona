#!/bin/bash
set -e  # Arrêter le script en cas d’erreur

echo "⬇️ Pull depuis Git"
git pull origin main

echo "📦 Installation des dépendances"
npm install

echo "🏗️ Build de l'application"
npm run build

echo "🧹 Nettoyage de l'ancien build"
rm -rf /var/www/gb-soona-front/*

echo "🚚 Déploiement du nouveau build"
cp -r dist/* /var/www/gb-soona-front/

echo "✅ Déploiement terminé avec succès"

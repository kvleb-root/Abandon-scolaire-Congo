#!/bin/bash

echo "🐳 Construction de l'image Docker..."
docker build -t prediction-abandon-scolaire .

echo "🚀 Lancement du conteneur..."
docker run -d -p 5000:5000 --name prediction-app prediction-abandon-scolaire

echo "✅ Application démarrée !"
echo "🌐 Accédez à l'application sur : http://localhost:5000"
echo ""
echo "📋 Commandes utiles :"
echo "  - Voir les logs : docker logs prediction-app"
echo "  - Arrêter : docker stop prediction-app"
echo "  - Redémarrer : docker start prediction-app"
echo "  - Supprimer : docker rm prediction-app" 
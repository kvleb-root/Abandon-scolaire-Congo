Write-Host "🐳 Construction de l'image Docker..." -ForegroundColor Green
docker build -t prediction-abandon-scolaire .

Write-Host "🚀 Lancement du conteneur..." -ForegroundColor Green
docker run -d -p 5000:5000 --name prediction-app prediction-abandon-scolaire

Write-Host "✅ Application démarrée !" -ForegroundColor Green
Write-Host "🌐 Accédez à l'application sur : http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Commandes utiles :" -ForegroundColor Yellow
Write-Host "  - Voir les logs : docker logs prediction-app"
Write-Host "  - Arrêter : docker stop prediction-app"
Write-Host "  - Redémarrer : docker start prediction-app"
Write-Host "  - Supprimer : docker rm prediction-app" 
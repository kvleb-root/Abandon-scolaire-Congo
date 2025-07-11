# 🎓 Système de Prédiction d'Abandon Scolaire

Une application web moderne utilisant l'intelligence artificielle pour prédire le risque d'abandon scolaire chez les étudiants. L'application combine un modèle de machine learning avec une interface utilisateur intuitive pour aider les équipes éducatives à identifier et accompagner les élèves en difficulté.

## ✨ Fonctionnalités Principales

### 🧠 Prédiction Intelligente
- **Modèle ML avancé** : Utilise un modèle entraîné pour prédire le risque d'abandon
- **Explications SHAP** : Visualisation de l'importance de chaque facteur dans la prédiction
- **Pourcentage de risque** : Estimation précise du niveau de risque (0-100%)
- **Raisons principales** : Identification des facteurs de risque clés

### 💡 Conseils Personnalisés
- **Recommandations adaptées** : Conseils spécifiques selon le profil de l'étudiant
- **Actions préventives** : Suggestions d'interventions ciblées
- **Accompagnement personnalisé** : Stratégies d'aide sur mesure

### 📊 Historique et Statistiques
- **Suivi des prédictions** : Historique complet des analyses effectuées
- **Graphiques interactifs** : Visualisation des tendances avec Chart.js
- **Export CSV** : Export des données pour analyse approfondie
- **Statistiques en temps réel** : Évolution du risque sur les 10 dernières prédictions

### 🎮 Simulation de Scénarios
- **Tests multiples** : Comparaison de différents profils d'étudiants
- **Sauvegarde de scénarios** : Stockage des configurations pour analyse comparative
- **Chargement rapide** : Restauration instantanée des scénarios précédents
- **Impact des changements** : Visualisation de l'effet des modifications

### 🌙 Mode Sombre
- **Interface adaptative** : Basculement entre thème clair et sombre
- **Préférence sauvegardée** : Mémorisation du choix de l'utilisateur
- **Design cohérent** : Adaptation de tous les éléments au thème choisi

### 📄 Export et Partage
- **Export Word** : Génération de rapports détaillés au format .doc
- **Export PDF** : Création de documents PDF professionnels
- **Inclusion des graphiques** : Intégration des visualisations SHAP dans les exports
- **Conseils inclus** : Incorporation des recommandations personnalisées

## 🛠️ Technologies Utilisées

### Backend
- **Flask** : Framework web Python pour l'API
- **Scikit-learn** : Modèle de machine learning
- **SHAP** : Explications des prédictions
- **Matplotlib** : Génération de graphiques
- **NumPy** : Calculs numériques

### Frontend
- **HTML5/CSS3** : Structure et style
- **JavaScript (ES6+)** : Interactivité et logique client
- **Tailwind CSS** : Framework CSS utilitaire
- **Chart.js** : Visualisations de données
- **jsPDF** : Génération de PDF

### Stockage
- **localStorage** : Persistance des données côté client
- **Base64** : Encodage des images pour les exports

## 🤖 Modèle de Machine Learning

### Entraînement
- **Plateforme** : Google Colab pour l'entraînement et le développement
- **Dataset** : Données d'étudiants avec informations académiques et personnelles
- **Algorithme** : Modèle de classification binaire (abandon/non-abandon)
- **Métriques** : Précision, rappel, F1-score optimisés pour la détection des cas à risque

### Caractéristiques du Modèle
- **Format** : Fichier pickle (.pkl) pour une intégration facile
- **Features** : 10 variables d'entrée normalisées
- **Performance** : Modèle optimisé pour la prédiction précoce
- **Explicabilité** : Compatible avec SHAP pour l'interprétation des résultats

## 📋 Facteurs Analysés

### Informations Personnelles
- Âge de l'étudiant (10-20 ans)
- Sexe
- Niveau scolaire actuel
- Historique de redoublement

### Performance Académique
- Note moyenne générale (sur 20)
- Nombre d'absences annuelles
- Distance domicile-école

### Contexte Familial
- Situation familiale (orphelin, parents vivants, monoparental)
- Statut professionnel des parents
- Accès à Internet à domicile

## 🎯 Interprétation des Résultats

### Risque Faible (0-30%)
- L'étudiant présente peu de facteurs de risque
- Continuez à surveiller et maintenez le soutien existant

### Risque Modéré (30-70%)
- Attention requise
- Mettez en place un suivi renforcé et des actions préventives ciblées

### Risque Élevé (70-100%)
- Intervention urgente nécessaire
- Développez un plan d'accompagnement personnalisé intensif

## 🚀 Installation et Démarrage

### Prérequis
- Python 3.7+
- pip (gestionnaire de paquets Python)

### Installation

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd partage
```

2. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

3. **Lancer l'application**
```bash
python app.py
```

4. **Accéder à l'application**
```
http://localhost:5000
```

## 🐳 Déploiement avec Docker

### Prérequis Docker
- Docker Desktop installé et en cours d'exécution
- Docker Compose (inclus avec Docker Desktop)

### Déploiement Rapide

**Option 1 : Avec Docker Compose (Recommandé)**
```bash
# Construire et démarrer l'application
docker-compose up -d

# Accéder à l'application
# http://localhost:5000

# Arrêter l'application
docker-compose down
```

**Option 2 : Avec Docker directement**
```bash
# Windows (PowerShell)
.\docker-build.ps1

# Linux/Mac (Bash)
./docker-build.sh
```

**Option 3 : Commandes manuelles**
```bash
# Construire l'image
docker build -t prediction-abandon-scolaire .

# Lancer le conteneur
docker run -d -p 5000:5000 --name prediction-app prediction-abandon-scolaire

# Accéder à l'application
# http://localhost:5000
```

### Commandes Docker Utiles

```bash
# Voir les logs du conteneur
docker logs prediction-app

# Arrêter le conteneur
docker stop prediction-app

# Redémarrer le conteneur
docker start prediction-app

# Supprimer le conteneur
docker rm prediction-app

# Voir les conteneurs en cours d'exécution
docker ps

# Voir toutes les images
docker images
```

### Avantages du Déploiement Docker

- **Isolation** : L'application fonctionne dans un environnement isolé
- **Portabilité** : Fonctionne sur n'importe quel système avec Docker
- **Cohérence** : Même environnement de développement et de production
- **Facilité de déploiement** : Une seule commande pour tout déployer
- **Gestion des dépendances** : Toutes les dépendances sont incluses dans l'image

## 📁 Structure du Projet

```
partage/
├── app.py                 # Application Flask principale
├── requirements.txt       # Dépendances Python
├── README.md             # Documentation du projet
├── templates/
│   ├── index.html        # Page principale
│   └── documentation.html # Page de documentation
├── static/
│   ├── style.css         # Styles CSS personnalisés
│   ├── script.js         # Logique JavaScript
│   └── img/
│       └── moi.jpg       # Logo de l'application
└── prediction/
    └── modele_abandon_scolaire.pkl  # Modèle ML entraîné
```

## 🔧 Configuration

### Variables d'Environnement
- Aucune variable d'environnement requise pour le moment
- Le modèle ML est inclus dans le projet

### Personnalisation
- **Couleurs** : Modifiez les variables CSS dans `static/style.css`
- **Logo** : Remplacez `static/img/moi.jpg` par votre logo
- **Modèle** : Remplacez le fichier `.pkl` par votre propre modèle

## 📖 Guide d'Utilisation

### 1. Remplir le Formulaire
- Saisissez toutes les informations demandées pour l'étudiant
- Assurez-vous que les données sont précises et à jour

### 2. Lancer la Prédiction
- Cliquez sur "Prédire l'Abandon Scolaire"
- Attendez le traitement (spinner visible)

### 3. Analyser les Résultats
- Consultez le pourcentage de risque
- Lisez les raisons principales
- Suivez les conseils personnalisés
- Examinez le graphique SHAP

### 4. Utiliser les Fonctionnalités Avancées
- **Simulation** : Testez différents scénarios
- **Historique** : Consultez les prédictions précédentes
- **Export** : Générez des rapports Word/PDF

## 🎨 Fonctionnalités Avancées

### Mode Sombre
- Bouton de basculement en haut à droite
- Sauvegarde automatique de la préférence
- Adaptation de tous les éléments

### Simulation de Scénarios
- Sauvegarde de configurations
- Comparaison de profils
- Chargement rapide des scénarios

### Explications SHAP
- Visualisation de l'importance des facteurs
- Graphiques waterfall interactifs
- Inclusion dans les exports

## 🔒 Sécurité et Confidentialité

### Bonnes Pratiques
- Validation des données côté serveur
- Protection contre les injections
- Respect de la confidentialité des données

### Recommandations
- Utilisez HTTPS en production
- Limitez l'accès aux utilisateurs autorisés
- Sauvegardez régulièrement les données

## 🐛 Dépannage

### Problèmes Courants

**L'application ne démarre pas**
- Vérifiez que Python 3.7+ est installé
- Installez les dépendances : `pip install -r requirements.txt`

**Erreur de modèle**
- Vérifiez que le fichier `modele_abandon_scolaire.pkl` est présent
- Assurez-vous que le modèle est compatible

**Problèmes d'affichage**
- Videz le cache du navigateur
- Vérifiez la console pour les erreurs JavaScript

## 🤝 Contribution

### Comment Contribuer
1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

### Standards de Code
- Suivez les conventions PEP 8 pour Python
- Utilisez des noms de variables explicites
- Documentez les nouvelles fonctionnalités

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Consultez la documentation intégrée (`/documentation`)
- Vérifiez les issues existantes
- Contactez l'équipe de développement

## 🎯 Roadmap

### Fonctionnalités Futures
- [ ] Authentification utilisateur
- [ ] Base de données pour persistance
- [ ] API REST complète
- [ ] Notifications en temps réel
- [ ] Intégration avec les systèmes scolaires
- [ ] Application mobile
- [ ] Analyses prédictives avancées
- [ ] Tableau de bord administrateur

---

**Développé par MERVEIL NKAZI avec ❤️ pour améliorer la réussite scolaire** 
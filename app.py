from flask import Flask, render_template, request, jsonify
import pickle
import numpy as np
import os
import shap
import matplotlib
import matplotlib.pyplot as plt
import uuid
import io
import base64

app = Flask(__name__)

# Charger le modèle
MODEL_PATH = os.path.join('prediction', 'modele_abandon_scolaire.pkl')
with open(MODEL_PATH, 'rb') as f:
    model = pickle.load(f)

# Encodage des variables catégorielles (doit correspondre à l'entraînement du modèle)
def encode_gender(val):
    return 1 if val == '1' else 0  # 1: Masculin, 0: Féminin

def encode_redoublement(val):
    return 1 if val == '1' else 0  # 1: Oui, 0: Non

def encode_internet(val):
    return 1 if val == '1' else 0  # 1: Oui, 0: Non

def encode_education(val):
    # 1: 6e, 2: 5e, 3: 4e, 4: 3e, 5: 2nde, 6: 1ère, 7: Terminale
    return int(val)

def encode_family(val):
    # 1: Orphelin, 2: Parents vivants, 3: Monoparental
    return int(val)

def encode_employment(val):
    # 1: Petits métiers, 2: Fonctionnaire, 3: Chômage
    return int(val)

def validate_input(data):
    errors = []
    try:
        age = int(data['age'])
        if not (10 <= age <= 20):
            errors.append("Âge hors limites (10-20).")
    except Exception:
        errors.append("Âge invalide.")
    try:
        note = float(data['note_moyenne'])
        if not (0 <= note <= 20):
            errors.append("Note moyenne hors limites (0-20).")
    except Exception:
        errors.append("Note moyenne invalide.")
    try:
        absences = int(data['absences'])
        if absences < 0:
            errors.append("Nombre d'absences négatif.")
    except Exception:
        errors.append("Nombre d'absences invalide.")
    try:
        dist = float(data['distance_ecole'])
        if dist < 0:
            errors.append("Distance à l'école négative.")
    except Exception:
        errors.append("Distance à l'école invalide.")
    if data['gender'] not in ['0', '1']:
        errors.append("Sexe invalide.")
    if data['education'] not in [str(i) for i in range(1,8)]:
        errors.append("Niveau scolaire invalide.")
    if data['redoublement'] not in ['0', '1']:
        errors.append("Redoublement invalide.")
    if data['family'] not in ['1', '2', '3']:
        errors.append("Situation familiale invalide.")
    if data['internet'] not in ['0', '1']:
        errors.append("Accès internet invalide.")
    if data['employment'] not in ['1', '2', '3']:
        errors.append("Travail des parents invalide.")
    if not data['nom'] or len(data['nom']) < 2:
        errors.append("Nom trop court ou manquant.")
    return errors

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/documentation')
def documentation():
    return render_template('documentation.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    errors = validate_input(data)
    if errors:
        return jsonify({'result': 'Erreur de validation : ' + ', '.join(errors)}), 400
    try:
        features = [
            int(data['age']),
            encode_gender(data['gender']),
            encode_education(data['education']),
            encode_redoublement(data['redoublement']),
            encode_family(data['family']),
            float(data['note_moyenne']),
            int(data['absences']),
            float(data['distance_ecole']),
            encode_internet(data['internet']),
            encode_employment(data['employment'])
        ]
        prediction = model.predict([features])[0]
        # Probabilité d'abandon (si disponible)
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba([features])[0][1]  # proba d'abandon
            pourcentage = round(proba * 100, 1)
        else:
            pourcentage = None
        # Raisons principales (exemple simple)
        raisons = []
        conseils = []
        if float(data['note_moyenne']) < 8:
            raisons.append("Note moyenne très faible")
            conseils.append("Essayez d'améliorer la note moyenne, par exemple en demandant du soutien scolaire.")
        if int(data['absences']) > 20:
            raisons.append("Beaucoup d'absences")
            conseils.append("Réduire le nombre d'absences peut fortement diminuer le risque d'abandon.")
        if int(data['redoublement']) == 1:
            raisons.append("A déjà redoublé")
            conseils.append("Un accompagnement pédagogique personnalisé peut aider après un redoublement.")
        if int(data['family']) == 1:
            raisons.append("Situation familiale difficile (orphelin)")
            conseils.append("Un suivi social ou psychologique peut être bénéfique dans une situation familiale difficile.")
        if float(data['distance_ecole']) > 15:
            raisons.append("École très éloignée")
            conseils.append("Réduire la distance ou faciliter le transport peut améliorer la persévérance scolaire.")
        if int(data['internet']) == 0:
            raisons.append("Pas d'accès Internet à la maison")
            conseils.append("Un accès Internet à la maison facilite la réussite scolaire.")
        if int(data['employment']) == 3:
            raisons.append("Parents au chômage")
            conseils.append("Un accompagnement social peut être utile pour les familles en difficulté professionnelle.")
        # Génération du graphique SHAP
        shap_img_base64 = None
        try:
            explainer = shap.Explainer(model)
            shap_values = explainer(np.array([features]))
            print('SHAP values type:', type(shap_values))
            if hasattr(shap_values, 'shape'):
                print('SHAP values shape:', shap_values.shape)
            else:
                print('SHAP values:', shap_values)
            plt.figure(figsize=(7, 2.5))
            # Pour la forme (1, 10, 2) : 1 prédiction, 10 features, 2 classes
            shap.plots.waterfall(shap_values[0, :, 1], show=False)
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight')
            plt.close()
            buf.seek(0)
            shap_img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        except Exception as e:
            print('Erreur SHAP:', e)
            shap_img_base64 = None
        result = "L'étudiant risque d'abandonner." if prediction == 1 else "L'étudiant n'abandonnera pas."
        return jsonify({
            'result': result,
            'pourcentage': pourcentage,
            'raisons': raisons,
            'conseils': conseils,
            'shap_img_base64': shap_img_base64
        })
    except Exception as e:
        return jsonify({'result': f'Erreur lors de la prédiction : {str(e)}'}), 400

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000) 
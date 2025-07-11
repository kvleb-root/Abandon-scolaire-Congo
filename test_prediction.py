import requests

# URL de l'API Flask
API_URL = 'http://127.0.0.1:5000/predict'

# Exemples de cas tests
cas_tests = [
    {
        'nom': 'Test1',
        'age': 15,
        'gender': '0',  # Féminin
        'education': '1',  # 6e
        'redoublement': '1',  # Oui
        'family': '1',  # Orphelin
        'note_moyenne': 5.0,
        'absences': 50,
        'distance_ecole': 30.0,
        'internet': '0',  # Non
        'employment': '3'  # Chômage
    },
    {
        'nom': 'Test2',
        'age': 17,
        'gender': '1',  # Masculin
        'education': '7',  # Terminale
        'redoublement': '0',  # Non
        'family': '2',  # Parents vivants
        'note_moyenne': 16.5,
        'absences': 2,
        'distance_ecole': 2.0,
        'internet': '1',  # Oui
        'employment': '2'  # Fonctionnaire
    }
]

for i, data in enumerate(cas_tests, 1):
    response = requests.post(API_URL, json=data)
    print(f"Cas test {i} : {data['nom']}")
    print("Réponse :", response.json()['result'])
    print('-' * 40) 
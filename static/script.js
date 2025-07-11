document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('predictionForm');
  const submitButton = document.getElementById('submitButton');
  const spinner = document.getElementById('spinner');
  const resultDiv = document.getElementById('predictionResult');
  const exportButtons = document.getElementById('exportButtons');
  const exportWordBtn = document.getElementById('exportWord');
  const exportPDFBtn = document.getElementById('exportPDF');
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photoPreview');
  const darkModeToggle = document.getElementById('darkModeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');
  const saveScenarioBtn = document.getElementById('saveScenario');
  const clearScenariosBtn = document.getElementById('clearScenarios');
  const scenariosContainer = document.getElementById('scenariosContainer');

  let historyChart = null;
  let scenarios = [];

  // Gestion du mode sombre
  function initDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }

  function toggleDarkMode() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('darkMode', newTheme === 'dark');
    
    if (newTheme === 'dark') {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    } else {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    }
  }

  // Initialiser le mode sombre
  initDarkMode();
  
  // Écouter le clic sur le bouton de mode sombre
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  function getPredictionData() {
    // Récupère les infos du formulaire et le résultat
    let imageHtml = '';
    const file = photoInput.files[0];
    if (file && file.type.startsWith('image/')) {
      if (photoPreview.firstChild && photoPreview.firstChild.tagName === 'IMG') {
        imageHtml = `<div style='text-align:center;margin-bottom:16px;'><img src='${photoPreview.firstChild.src}' alt='Photo étudiant' style='max-width:120px;max-height:120px;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.12);'/></div>`;
      }
    }
    const data = [];
    const fields = [
      { label: "Nom", value: form.nom.value },
      { label: "Âge", value: form.age.value },
      { label: "Sexe", value: form.gender.options[form.gender.selectedIndex].text },
      { label: "Niveau Scolaire", value: form.education.options[form.education.selectedIndex].text },
      { label: "Redoublement", value: form.querySelector('input[name=\"redoublement\"]:checked') ? (form.querySelector('input[name=\"redoublement\"]:checked').value === '1' ? 'Oui' : 'Non') : '' },
      { label: "Situation Familiale", value: form.family.options[form.family.selectedIndex].text },
      { label: "Note Moyenne", value: form.note_moyenne.value },
      { label: "Nombre d'Absences", value: form.absences.value },
      { label: "Distance à l'École", value: form.distance_ecole.value },
      { label: "Accès Internet", value: form.querySelector('input[name=\"internet\"]:checked') ? (form.querySelector('input[name=\"internet\"]:checked').value === '1' ? 'Oui' : 'Non') : '' },
      { label: "Travail des Parents", value: form.employment.options[form.employment.selectedIndex].text },
    ];
    fields.forEach(f => data.push(`<tr><td style='padding:4px 12px;border:1px solid #eee;'>${f.label}</td><td style='padding:4px 12px;border:1px solid #eee;'>${f.value}</td></tr>`));

    // Récupère les détails de la prédiction affichés (pourcentage, raisons)
    let details = resultDiv.innerHTML;
    // Ajoute le graphique SHAP à l'export si présent
    let shapImgHtml = '';
    if (window._lastShapImg) {
      shapImgHtml = `<div style='text-align:center;margin:18px 0;'><img src='${window._lastShapImg}' alt='Graphique SHAP' style='max-width:400px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin:auto;'/><div style='font-size:12px;color:#888;'>Explication de la prédiction (SHAP)</div></div>`;
    }
    // Ajoute les conseils personnalisés à l'export si présents
    let conseilsHtml = '';
    if (window._lastConseils && window._lastConseils.length > 0) {
      conseilsHtml = `<div style='margin:18px 0;padding:12px;background-color:#f0f8ff;border:1px solid #b3d9ff;border-radius:8px;'><div style='font-weight:bold;color:#1976d2;margin-bottom:8px;'>Conseils personnalisés :</div><ul style='margin:0;padding-left:1em;color:#1976d2;'>`;
      window._lastConseils.forEach(c => {
        conseilsHtml += `<li style='margin-bottom:4px;'>${c}</li>`;
      });
      conseilsHtml += "</ul></div>";
    }
    // Mise en forme du titre
    const titre = `<h1 style="text-align:center;color:#1990e5;font-size:2em;font-family:'Public Sans','Noto Sans',sans-serif;margin-bottom:0.5em;letter-spacing:0.04em;">Rapport de Prédiction d'Abandon Scolaire</h1>`;
    return {
      html: `${titre}${imageHtml}<h2 style='color:#333;text-align:center;margin-bottom:1em;'>Résultat de la prédiction</h2><table style='border-collapse:collapse;margin:auto;margin-bottom:1.5em;'>${data.join('')}</table><div style='margin:auto;max-width:500px;'>${details}</div>${conseilsHtml}${shapImgHtml}`
    };
  }

  function savePredictionToHistory(data, result) {
    const history = JSON.parse(localStorage.getItem('predictions') || '[]');
    history.push({ ...data, result, date: new Date().toLocaleString() });
    localStorage.setItem('predictions', JSON.stringify(history));
  }

  function renderHistoryChart() {
    const history = JSON.parse(localStorage.getItem('predictions') || '[]');
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (!ctx) return;
    // Données : pourcentage de risque si présent, sinon 0
    const labels = history.slice(-10).reverse().map(item => item.date || '');
    const risks = history.slice(-10).reverse().map(item => {
      const match = /([0-9]+\.?[0-9]*)%/.exec(item.result);
      if (match) return parseFloat(match[1]);
      if (item.pourcentage) return parseFloat(item.pourcentage);
      return 0;
    });
    if (historyChart) historyChart.destroy();
    historyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Risque d\'abandon (%)',
          data: risks,
          backgroundColor: risks.map(r => r > 50 ? '#ff9800' : '#1990e5'),
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Risque d\'abandon sur les 10 dernières prédictions' }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    });
  }

  function renderHistory() {
    const history = JSON.parse(localStorage.getItem('predictions') || '[]');
    const container = document.getElementById('historyContainer');
    if (!container) return;
    if (history.length === 0) {
      container.innerHTML = '<p class="text-center text-gray-500">Aucune prédiction enregistrée.</p>';
      return;
    }
    let html = '<table class="w-full text-sm"><thead><tr><th>Date</th><th>Nom</th><th>Résultat</th></tr></thead><tbody>';
    history.slice(-10).reverse().forEach(item => {
      html += `<tr><td>${item.date}</td><td>${item.nom}</td><td>${item.result}</td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    renderHistoryChart();
  }

  // Export CSV de l'historique
  function exportHistoryCSV() {
    const history = JSON.parse(localStorage.getItem('predictions') || '[]');
    if (history.length === 0) {
      alert('Aucune prédiction à exporter.');
      return;
    }
    const headers = Object.keys(history[0]);
    const csvRows = [headers.join(',')];
    history.forEach(item => {
      csvRows.push(headers.map(h => '"' + (item[h] || '').toString().replace(/"/g, '""') + '"').join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historique_predictions.csv';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  }

  // Gestion des scénarios de simulation
  function getFormData() {
    return {
      nom: form.nom.value,
      age: form.age.value,
      gender: form.gender.value,
      education: form.education.value,
      redoublement: form.querySelector('input[name="redoublement"]:checked')?.value,
      family: form.family.value,
      note_moyenne: form.note_moyenne.value,
      absences: form.absences.value,
      distance_ecole: form.distance_ecole.value,
      internet: form.querySelector('input[name="internet"]:checked')?.value,
      employment: form.employment.value
    };
  }

  function saveScenario() {
    const formData = getFormData();
    const scenarioName = prompt('Nom du scénario :', `Scénario ${scenarios.length + 1}`);
    if (!scenarioName) return;
    
    const scenario = {
      id: Date.now(),
      name: scenarioName,
      data: formData,
      date: new Date().toLocaleString()
    };
    
    scenarios.push(scenario);
    localStorage.setItem('scenarios', JSON.stringify(scenarios));
    renderScenarios();
  }

  function loadScenario(scenarioId) {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;
    
    // Remplir le formulaire avec les données du scénario
    form.nom.value = scenario.data.nom;
    form.age.value = scenario.data.age;
    form.gender.value = scenario.data.gender;
    form.education.value = scenario.data.education;
    form.family.value = scenario.data.family;
    form.note_moyenne.value = scenario.data.note_moyenne;
    form.absences.value = scenario.data.absences;
    form.distance_ecole.value = scenario.data.distance_ecole;
    form.employment.value = scenario.data.employment;
    
    // Gérer les boutons radio
    if (scenario.data.redoublement) {
      form.querySelector(`input[name="redoublement"][value="${scenario.data.redoublement}"]`).checked = true;
    }
    if (scenario.data.internet) {
      form.querySelector(`input[name="internet"][value="${scenario.data.internet}"]`).checked = true;
    }
  }

  function deleteScenario(scenarioId) {
    scenarios = scenarios.filter(s => s.id !== scenarioId);
    localStorage.setItem('scenarios', JSON.stringify(scenarios));
    renderScenarios();
  }

  function clearAllScenarios() {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les scénarios ?')) {
      scenarios = [];
      localStorage.removeItem('scenarios');
      renderScenarios();
    }
  }

  function renderScenarios() {
    if (!scenariosContainer) return;
    
    if (scenarios.length === 0) {
      scenariosContainer.innerHTML = '<p class="text-sm text-gray-500 text-center">Aucun scénario sauvegardé</p>';
      return;
    }
    
    let html = '';
    scenarios.forEach(scenario => {
      html += `
        <div class="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-semibold text-gray-800 dark:text-gray-200">${scenario.name}</h4>
            <div class="flex gap-1">
              <button onclick="loadScenario(${scenario.id})" class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition">
                Charger
              </button>
              <button onclick="deleteScenario(${scenario.id})" class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition">
                Supprimer
              </button>
            </div>
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-400">
            <div>Nom: ${scenario.data.nom}</div>
            <div>Âge: ${scenario.data.age} | Note: ${scenario.data.note_moyenne}/20 | Absences: ${scenario.data.absences}</div>
            <div>Créé le: ${scenario.date}</div>
          </div>
        </div>
      `;
    });
    scenariosContainer.innerHTML = html;
  }

  // Initialiser les scénarios
  function initScenarios() {
    const savedScenarios = localStorage.getItem('scenarios');
    if (savedScenarios) {
      scenarios = JSON.parse(savedScenarios);
    }
    renderScenarios();
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Validation simple
    let valid = true;
    const requiredFields = ['nom','age', 'gender', 'education', 'redoublement', 'family', 'note_moyenne', 'absences', 'distance_ecole', 'internet', 'employment'];
    requiredFields.forEach(function (field) {
      const el = form.elements[field];
      if (!el || (el.type === 'radio' && !form.querySelector('input[name="' + field + '"]:checked')) || (el.value === '')) {
        valid = false;
      }
    });
    if (!valid) {
      resultDiv.textContent = 'Veuillez remplir tous les champs.';
      resultDiv.classList.remove('hidden');
      resultDiv.classList.remove('fade-in');
      resultDiv.classList.add('bg-red-100', 'text-red-700');
      exportButtons.classList.add('hidden');
      return;
    }
    // Affiche le spinner
    spinner.classList.remove('hidden');
    submitButton.setAttribute('disabled', 'disabled');
    resultDiv.classList.add('hidden');
    exportButtons.classList.add('hidden');

    // Récupérer les données du formulaire
    const data = {
      nom: form.nom.value,
      age: form.age.value,
      gender: form.gender.value,
      education: form.education.value,
      redoublement: form.querySelector('input[name="redoublement"]:checked')?.value,
      family: form.family.value,
      note_moyenne: form.note_moyenne.value,
      absences: form.absences.value,
      distance_ecole: form.distance_ecole.value,
      internet: form.querySelector('input[name="internet"]:checked')?.value,
      employment: form.employment.value
    };

    fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
      spinner.classList.add('hidden');
      submitButton.removeAttribute('disabled');
      // Détermine la couleur et l'icône selon le résultat
      let isAbandon = response.result && response.result.toLowerCase().includes('abandonner');
      let icon = isAbandon
        ? `<svg width="32" height="32" fill="#ff9800" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`
        : `<svg width="32" height="32" fill="#4caf50" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 15l-5-5 1.41-1.41L11 13.17l6.59-6.59L19 8l-8 9z"/></svg>`;
      let boxColor = isAbandon ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-green-100 border-green-300 text-green-800';
      let details = `<div class="flex flex-col items-center justify-center ${boxColor} border-2 rounded-xl p-4 shadow-md animate-fadein">${icon}<div class="mt-2">${response.result}`;
      if (response.pourcentage !== null && response.pourcentage !== undefined) {
        details += ` <span class='font-bold'>(Risque estimé : <b>${response.pourcentage}%</b>)</span>`;
      }
      if (response.raisons && response.raisons.length > 0) {
        details += "<br><span class='text-sm text-[#ff9800]'>Raisons principales :<ul style='margin:0;padding-left:1em'>";
        response.raisons.forEach(r => {
          details += `<li>${r}</li>`;
        });
        details += "</ul></span>";
      }
      // Ajout des conseils personnalisés
      if (response.conseils && response.conseils.length > 0) {
        details += "<div class='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'><div class='flex items-center mb-2'><svg width='20' height='20' fill='#1976d2' viewBox='0 0 24 24'><path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/></svg><span class='ml-2 font-semibold text-blue-800'>Conseils personnalisés :</span></div><ul class='text-sm text-blue-700 space-y-1'>";
        response.conseils.forEach(c => {
          details += `<li class='flex items-start'><span class='mr-2 mt-1'>•</span><span>${c}</span></li>`;
        });
        details += "</ul></div>";
        // Stocke les conseils pour l'export
        window._lastConseils = response.conseils;
      } else {
        window._lastConseils = null;
      }
      // Ajout du graphique SHAP si présent (base64)
      if (response.shap_img_base64) {
        details += `<div class='mt-4'><img src='data:image/png;base64,${response.shap_img_base64}' alt='Graphique SHAP' style='max-width:100%;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.10);margin:auto;'/><div class='text-xs text-gray-500 mt-1'>Explication de la prédiction (SHAP)</div></div>`;
        window._lastShapImg = `data:image/png;base64,${response.shap_img_base64}`;
      } else {
        window._lastShapImg = null;
      }
      details += '</div></div>';
      resultDiv.innerHTML = details;
      resultDiv.classList.remove('hidden', 'bg-red-100', 'text-red-700');
      resultDiv.classList.add('fade-in');
      exportButtons.classList.remove('hidden');
      savePredictionToHistory(data, response.result);
      renderHistory();
    })
    .catch((err) => {
      spinner.classList.add('hidden');
      submitButton.removeAttribute('disabled');
      let msg = 'Erreur lors de la prédiction.';
      if (err && err.response && err.response.result) {
        msg = err.response.result;
      }
      resultDiv.textContent = msg;
      resultDiv.classList.remove('hidden');
      resultDiv.classList.add('bg-red-100', 'text-red-700');
      exportButtons.classList.add('hidden');
    });
  });

  // Export Word
  exportWordBtn.addEventListener('click', function () {
    exportWordBtn.textContent = 'Génération...';
    exportWordBtn.disabled = true;
    const { html } = getPredictionData();
    const blob = new Blob([
      `<html><head><meta charset='utf-8'></head><body>${html}</body></html>`
    ], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prediction.doc';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      exportWordBtn.textContent = 'Exporter en Word';
      exportWordBtn.disabled = false;
    }, 0);
  });

  // Export PDF (nécessite jsPDF)
  exportPDFBtn.addEventListener('click', function () {
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      alert('jsPDF n\'est pas chargé.');
      return;
    }
    exportPDFBtn.textContent = 'Génération...';
    exportPDFBtn.disabled = true;
    const { html } = getPredictionData();
    const doc = new window.jspdf.jsPDF();
    doc.html(html, {
      callback: function (doc) {
        doc.save('prediction.pdf');
        exportPDFBtn.textContent = 'Exporter en PDF';
        exportPDFBtn.disabled = false;
      },
      x: 10,
      y: 10,
      html2canvas: { scale: 0.6, useCORS: true }
    });
  });

  // Charger jsPDF dynamiquement si besoin
  if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function () {
      window.jspdf = window.jspdf || window.jsPDF;
    };
    document.body.appendChild(script);
  }

  photoInput.addEventListener('change', function () {
    photoPreview.innerHTML = '';
    const file = photoInput.files[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        alert('Seuls les fichiers JPEG, PNG ou GIF sont autorisés.');
        photoInput.value = '';
        return;
      }
      if (file.size > 1024 * 1024) { // 1 Mo
        alert('Image trop volumineuse (max 1 Mo).');
        photoInput.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.alt = 'Aperçu photo';
        img.style.maxWidth = '120px';
        img.style.maxHeight = '120px';
        img.style.borderRadius = '12px';
        img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
        photoPreview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  // Ajoute une animation fade-in
  const style = document.createElement('style');
  style.innerHTML = `@keyframes fadein { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none;} } .animate-fadein { animation: fadein 0.7s cubic-bezier(.23,1,.32,1); }`;
  document.head.appendChild(style);

  // Lien bouton export CSV
  const exportHistoryCSVBtn = document.getElementById('exportHistoryCSV');
  if (exportHistoryCSVBtn) {
    exportHistoryCSVBtn.addEventListener('click', exportHistoryCSV);
  }

  // Event listeners pour les scénarios
  if (saveScenarioBtn) {
    saveScenarioBtn.addEventListener('click', saveScenario);
  }
  if (clearScenariosBtn) {
    clearScenariosBtn.addEventListener('click', clearAllScenarios);
  }

  // Rendre les fonctions globales pour les boutons onclick
  window.loadScenario = loadScenario;
  window.deleteScenario = deleteScenario;

  // Affiche l'historique au chargement
  renderHistory();

  // Initialiser les scénarios
  initScenarios();
}); 
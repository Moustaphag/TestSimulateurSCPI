import React, { useState, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SimulateurAssuranceVie = () => {
  // États pour stocker les entrées utilisateur
  const [age, setAge] = useState(30);
  const [duree, setDuree] = useState(20);
  const [tauxInteret, setTauxInteret] = useState(2.5);
  const [versementInitial, setVersementInitial] = useState(5000);
  const [versementMensuel, setVersementMensuel] = useState(200);
  const [fraisEntree, setFraisEntree] = useState(3.0);
  const [fraisGestion, setFraisGestion] = useState(0.75);
  const [activeTab, setActiveTab] = useState('parametres');
  
  const simulateurRef = useRef(null);

  // Fonction pour générer le PDF
  const genererPDF = () => {
    // En situation réelle, on utiliserait une bibliothèque comme jsPDF ou html2pdf
    // Pour cette démo, nous allons simuler le téléchargement en ouvrant une nouvelle fenêtre
    const contenu = document.createElement('div');
    
    // En-tête
    const header = document.createElement('h1');
    header.innerText = 'Simulation d\'assurance vie épargne';
    contenu.appendChild(header);
    
    // Paramètres
    const parametresSection = document.createElement('div');
    parametresSection.innerHTML = `
      <h2>Paramètres de la simulation</h2>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Paramètre</th>
          <th>Valeur</th>
        </tr>
        <tr>
          <td>Versement initial</td>
          <td>${versementInitial.toLocaleString('fr-FR')} €</td>
        </tr>
        <tr>
          <td>Versement mensuel</td>
          <td>${versementMensuel.toLocaleString('fr-FR')} €</td>
        </tr>
        <tr>
          <td>Durée</td>
          <td>${duree} ans</td>
        </tr>
        <tr>
          <td>Taux d'intérêt annuel</td>
          <td>${tauxInteret} %</td>
        </tr>
        <tr>
          <td>Frais d'entrée</td>
          <td>${fraisEntree} %</td>
        </tr>
        <tr>
          <td>Frais de gestion</td>
          <td>${fraisGestion} %</td>
        </tr>
      </table>
    `;
    contenu.appendChild(parametresSection);
    
    // Résultats
    const resultatsSection = document.createElement('div');
    const dernierAnnee = genererTableauEpargne()[duree - 1];
    const capitalFinal = parseFloat(calculerEpargne());
    const versementsBruts = parseFloat(dernierAnnee.versementsBruts);
    const fraisEntreeTotal = parseFloat(dernierAnnee.fraisEntreeTotal);
    const interetsGeneres = parseFloat(dernierAnnee.interets);
    
    resultatsSection.innerHTML = `
      <h2>Résultats à l'échéance (${duree} ans)</h2>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Indicateur</th>
          <th>Montant</th>
        </tr>
        <tr>
          <td>Capital final</td>
          <td>${capitalFinal.toLocaleString('fr-FR')} €</td>
        </tr>
        <tr>
          <td>Versements nets</td>
          <td>${(versementsBruts - fraisEntreeTotal).toLocaleString('fr-FR')} €</td>
        </tr>
        <tr>
          <td>Intérêts générés</td>
          <td>${interetsGeneres.toLocaleString('fr-FR')} €</td>
        </tr>
        <tr>
          <td>Frais d'entrée</td>
          <td>${fraisEntreeTotal.toLocaleString('fr-FR')} €</td>
        </tr>
      </table>
    `;
    contenu.appendChild(resultatsSection);
    
    // Tableau d'évolution
    const evolutionSection = document.createElement('div');
    evolutionSection.innerHTML = `
      <h2>Évolution de l'épargne</h2>
      <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">
        <tr>
          <th>Année</th>
          <th>Capital cumulé</th>
          <th>Versements bruts</th>
          <th>Frais d'entrée</th>
          <th>Intérêts générés</th>
        </tr>
        ${genererTableauEpargne().map(ligne => `
          <tr>
            <td>${ligne.annee}</td>
            <td>${parseFloat(ligne.epargne).toLocaleString('fr-FR')} €</td>
            <td>${parseFloat(ligne.versementsBruts).toLocaleString('fr-FR')} €</td>
            <td>${parseFloat(ligne.fraisEntreeTotal).toLocaleString('fr-FR')} €</td>
            <td>${parseFloat(ligne.interets).toLocaleString('fr-FR')} €</td>
          </tr>
        `).join('')}
      </table>
    `;
    contenu.appendChild(evolutionSection);
    
    // Note de bas de page
    const footer = document.createElement('p');
    footer.innerHTML = '<em>Document généré à titre informatif seulement. Les résultats sont des estimations et peuvent varier en fonction de nombreux facteurs.</em>';
    contenu.appendChild(footer);
    
    // Ouvrir dans une nouvelle fenêtre pour impression/sauvegarde PDF
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <html>
        <head>
          <title>Simulation Assurance Vie - ${new Date().toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; text-align: center; }
            h2 { color: #1e3a8a; margin-top: 30px; }
            table { margin-bottom: 20px; width: 100%; }
            th { background-color: #f1f5f9; }
            td, th { padding: 8px; text-align: left; }
            tr:nth-child(even) { background-color: #f8fafc; }
          </style>
        </head>
        <body>
          ${contenu.innerHTML}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    newWindow.document.close();
  };

  // Fonction pour calculer l'épargne totale pour un contrat d'assurance vie épargne
  const calculerEpargne = () => {
    // Application des frais d'entrée
    let epargne = versementInitial * (1 - fraisEntree / 100);
    const tauxMensuel = (tauxInteret - fraisGestion) / 100 / 12;
    const versementMensuelNet = versementMensuel * (1 - fraisEntree / 100);
    
    // Simuler l'accumulation mensuelle
    for (let mois = 1; mois <= duree * 12; mois++) {
      epargne = epargne * (1 + tauxMensuel) + versementMensuelNet;
    }
    
    return epargne.toFixed(2);
  };

  // Tableau de l'évolution de l'épargne par année
  const genererTableauEpargne = () => {
    const resultats = [];
    // Application des frais d'entrée
    let epargne = versementInitial * (1 - fraisEntree / 100);
    const tauxMensuel = (tauxInteret - fraisGestion) / 100 / 12;
    const versementMensuelNet = versementMensuel * (1 - fraisEntree / 100);
    
    // Calculer le total des versements bruts (avant frais)
    const versementInitialBrut = versementInitial;
    const versementMensuelBrut = versementMensuel;
    
    for (let annee = 1; annee <= duree; annee++) {
      // Simuler l'année
      for (let mois = 1; mois <= 12; mois++) {
        epargne = epargne * (1 + tauxMensuel) + versementMensuelNet;
      }
      
      const versementsTotauxBruts = versementInitialBrut + versementMensuelBrut * 12 * annee;
      const versementsTotauxNets = versementInitialBrut * (1 - fraisEntree / 100) + versementMensuelBrut * (1 - fraisEntree / 100) * 12 * annee;
      const fraisDEntree = versementsTotauxBruts - versementsTotauxNets;
      
      resultats.push({
        annee,
        epargne: epargne.toFixed(2),
        versementsBruts: versementsTotauxBruts.toFixed(2),
        fraisEntreeTotal: fraisDEntree.toFixed(2),
        interets: (epargne - versementsTotauxNets).toFixed(2)
      });
    }
    
    return resultats;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md" ref={simulateurRef}>
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-800">Simulateur d'Assurance Vie Épargne</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === 'parametres' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('parametres')}
          >
            Paramètres
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'evolution' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('evolution')}
          >
            Évolution de l'épargne
          </button>
        </div>
      </div>
      
      {activeTab === 'parametres' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="18"
                max="80"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versement initial (€)</label>
              <input
                type="number"
                value={versementInitial}
                onChange={(e) => setVersementInitial(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Versement mensuel (€)</label>
              <input
                type="number"
                value={versementMensuel}
                onChange={(e) => setVersementMensuel(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (années)</label>
              <input
                type="number"
                value={duree}
                onChange={(e) => setDuree(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="1"
                max="40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taux d'intérêt annuel (%)</label>
              <input
                type="number"
                value={tauxInteret}
                onChange={(e) => setTauxInteret(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="0"
                max="10"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais d'entrée (%)</label>
              <input
                type="number"
                value={fraisEntree}
                onChange={(e) => setFraisEntree(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="0"
                max="5"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais de gestion annuels (%)</label>
              <input
                type="number"
                value={fraisGestion}
                onChange={(e) => setFraisGestion(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded"
                min="0"
                max="2"
                step="0.05"
              />
            </div>
          </div>
          
          <div className="mt-8 mb-8">
            <h3 className="font-semibold text-lg mb-4">Graphique de projection</h3>
            
            <div className="border rounded-lg p-4 shadow-sm">
              <h4 className="text-center font-medium mb-2">Structure du capital par année</h4>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={genererTableauEpargne().map(annee => {
                    const versementsNets = parseFloat(annee.versementsBruts) - parseFloat(annee.fraisEntreeTotal);
                    const interets = parseFloat(annee.interets);
                    
                    return {
                      annee: annee.annee,
                      "Versements nets": versementsNets,
                      "Intérêts cumulés": interets,
                      "Frais d'entrée": parseFloat(annee.fraisEntreeTotal)
                    };
                  })}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="annee" />
                  <YAxis tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return (value / 1000000).toFixed(1) + ' M€';
                    } else if (value >= 1000) {
                      return (value / 1000).toFixed(0) + ' k€';
                    }
                    return value + ' €';
                  }} />
                  <Tooltip formatter={(value) => parseFloat(value).toLocaleString('fr-FR') + ' €'} />
                  <Legend />
                  <Bar dataKey="Versements nets" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Intérêts cumulés" stackId="a" fill="#22c55e" />
                  <Bar dataKey="Frais d'entrée" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Récapitulatif des totaux */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-semibold text-center mb-3">Récapitulatif à l'échéance ({duree} ans)</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-600">Montant total du contrat</div>
                  <div className="text-xl font-bold text-blue-800">
                    {parseFloat(calculerEpargne()).toLocaleString('fr-FR')} €
                  </div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-600">Versements nets</div>
                  <div className="text-xl font-bold text-blue-600">
                    {(() => {
                      const dernierAnnee = genererTableauEpargne()[duree - 1];
                      const versementsBruts = parseFloat(dernierAnnee.versementsBruts);
                      const fraisEntreeTotal = parseFloat(dernierAnnee.fraisEntreeTotal);
                      return (versementsBruts - fraisEntreeTotal).toLocaleString('fr-FR');
                    })()} €
                  </div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-600">Intérêts générés</div>
                  <div className="text-xl font-bold text-green-600">
                    {(() => {
                      const dernierAnnee = genererTableauEpargne()[duree - 1];
                      return parseFloat(dernierAnnee.interets).toLocaleString('fr-FR');
                    })()} €
                  </div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-sm text-gray-600">Total frais d'entrée</div>
                  <div className="text-xl font-bold text-red-600">
                    {(() => {
                      const dernierAnnee = genererTableauEpargne()[duree - 1];
                      return parseFloat(dernierAnnee.fraisEntreeTotal).toLocaleString('fr-FR');
                    })()} €
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'evolution' && (
        <div>
          <h3 className="font-semibold text-lg mb-4">Évolution de votre épargne</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border">Année</th>
                  <th className="py-2 px-4 border">Capital cumulé</th>
                  <th className="py-2 px-4 border">Total versements bruts</th>
                  <th className="py-2 px-4 border">Frais d'entrée</th>
                  <th className="py-2 px-4 border">Intérêts générés</th>
                </tr>
              </thead>
              <tbody>
                {genererTableauEpargne().map((ligne) => (
                  <tr key={ligne.annee}>
                    <td className="py-2 px-4 border">{ligne.annee}</td>
                    <td className="py-2 px-4 border text-right">{parseFloat(ligne.epargne).toLocaleString('fr-FR')} €</td>
                    <td className="py-2 px-4 border text-right">{parseFloat(ligne.versementsBruts).toLocaleString('fr-FR')} €</td>
                    <td className="py-2 px-4 border text-right text-red-600">{parseFloat(ligne.fraisEntreeTotal).toLocaleString('fr-FR')} €</td>
                    <td className="py-2 px-4 border text-right text-green-600">{parseFloat(ligne.interets).toLocaleString('fr-FR')} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Note importante: Ce simulateur est fourni à titre informatif seulement. Les résultats sont des estimations et peuvent varier en fonction de nombreux facteurs. Pour une offre personnalisée, veuillez consulter un conseiller en assurance.</p>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button 
          onClick={genererPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Télécharger la simulation (PDF)
        </button>
      </div>
    </div>
  );
};

export default SimulateurAssuranceVie;

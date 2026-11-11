# Coach — programme hebdomadaire guidé

Application web d'une seule page (`index.html` : CSS, JavaScript, dessins et vidéo muette en ligne ;
aucune dépendance, aucune clé d'API, aucun compte). On l'ouvre sur l'iPhone et on la recopie en
AirPlay sur l'Apple TV. Elle guide la séance de bout en bout, à la voix, sans toucher le téléphone.

**URL finale (après publication) : `https://TON-UTILISATEUR.github.io/coach/`**
(remplace `TON-UTILISATEUR` par ton identifiant GitHub).

La page ne contient **aucune donnée de santé**. Les objectifs sont dans `programme.json`, l'historique
reste sur l'iPhone et s'exporte en CSV pour l'analyse mensuelle avec les données de l'Apple Watch.

---

## Ce que fait l'app

- **Programme de la semaine** (défini dans `programme.json`) : force lundi / mercredi / vendredi
  (alternance A / B), marche mardi / jeudi, sortie longue VTT le samedi, repos le dimanche,
  **sauna infrarouge mardi et jeudi matin**, séance du soir tous les soirs.
- **Séance guidée** : nom de l'exercice en très gros, **dessin animé du mouvement**, répétitions visées,
  « série 2 sur 3 », minuteur de série, repos de 60 à 90 s avec compte à rebours et bip, consignes
  de respiration à la voix. Bande permanente : « 12 à 20 répétitions · Expire à l'effort ·
  2-3 répétitions en réserve ».
- **Sauna** : pas de minuteur. Un bouton **« Sauna fait ✓ »** à toucher en sortant ; l'app note le
  sauna avec un début égal à « maintenant − durée prévue » (25 min par défaut).
- **Demain** : la veille, l'app affiche la séance du lendemain, sa durée, le matériel à préparer et
  **l'heure de lever** (réglages : heure de fin souhaitée, temps entre le lever et le début).
  Ex. : séance A ≈ 32 min, fin 8 h 00, marge 15 min → *Lever 7 h 13 · début 7 h 28*.
  Jour marche + sauna : 30 + 25 + 10 min de transition. Après 18 h, cette carte passe en premier.
- **Bilan** à partir des séances faites : semaine en cours jour par jour (prévu / fait), compteurs
  force / sauna / soirs / marche par rapport aux cibles, régularité de la force sur 4 semaines,
  tableau des 4 dernières semaines, calendrier. Bouton **Rattrapage** si une séance de force a été manquée.
- **Hors programme** : séance libre de 10, 20, 30 ou 40 min, construite uniquement avec les exercices
  de A et B, échauffement et mollets excentriques toujours inclus, sans toucher à l'alternance.
- **Météo Annecy** (Open-Meteo) : intérieur / extérieur, **meilleure fenêtre VTT de 2 h** sur 3 jours,
  rappel de protection solaire si UV ≥ 3, alerte boue si > 5 mm de pluie sur 24 h. Si la météo ne
  répond pas en 3 s : « Météo indisponible — séance en intérieur ».
- Fin de séance : récapitulatif et rappel **« Enregistre la séance sur l'Apple Watch : Renforcement
  musculaire fonctionnel »** (sans cela, rien n'arrive dans Apple Santé).

## Redéfinir les objectifs (après chaque analyse mensuelle)

Tout se règle dans `programme.json`, sans toucher à la page :

```json
{
  "version": "2026-11",
  "note": "Texte libre affiché dans le bilan.",
  "semaine": { "lundi": "force", "mardi": "marche", "mercredi": "force", "jeudi": "marche",
               "vendredi": "force", "samedi": "sortie_longue", "dimanche": "repos" },
  "sauna": { "jours": ["mardi", "jeudi"], "duree_min": 25 },
  "cibles": { "force": 3, "sauna": 2, "soir": 7, "marche": 2 },
  "intensite": false,
  "repos_series_s": 60,
  "repos_exercices_s": 75,
  "objectifs": ["…", "…"]
}
```

- Valeurs possibles pour chaque jour : `force`, `marche`, `sortie_longue`, `intensite`, `repos`.
- `intensite: true` ajoute la séance intensité (5 × 2 min de montées de step) : proposée en option,
  et utilisée le jour `sortie_longue` s'il n'y a pas de fenêtre VTT.
- Les repos sont toujours ramenés entre 60 et 90 s, même si le fichier indique autre chose.
- Les exercices, les séries et les fourchettes de répétitions (jamais sous 12) sont dans la page et
  ne se modifient pas par ce fichier.

Après modification : `git commit -am "programme 2026-12" && git push`. L'app relit le fichier à chaque
ouverture (copie en cache si hors ligne). Le numéro de `version` est inscrit dans chaque ligne du CSV,
ce qui permet de comparer les mois entre eux.

## Export CSV pour l'analyse mensuelle

Accueil › Réglages › **Exporter l'historique (CSV)** → feuille de partage iOS (Enregistrer dans
Fichiers, AirDrop, Mail…). Fichier `coach-historique-AAAA-MM-JJ.csv`, séparateur `;`, UTF-8,
**une ligne par élément de séance** :

| colonne | contenu |
|---|---|
| `date`, `jour` | date de la séance |
| `seance`, `code` | ex. « Séance A » / `A` ; codes : A, B, L (libre), I (intensité), M (marche), N (sauna), S (soir) |
| `statut` | `terminée` ou `interrompue` (arrêtée après plus d'1 min ; absente du bilan, présente dans l'export) |
| `heure_debut`, `heure_fin`, `duree_min` | horaires réels de la séance, à recaler sur les entraînements Apple Watch |
| `programme_du_jour` | ce qui était prévu ce jour-là (ex. « Marche 30 min + sauna ») |
| `element` | exercice ou bloc (Échauffement, Tirage horizontal, Sauna infrarouge…) |
| `prevu`, `fait` | séries prévues / séries faites (« Passer » compte comme fait) |
| `cible` | répétitions ou durée visées |
| `debut_element`, `fin_element` | horaires de l'exercice, pour isoler la fréquence cardiaque exercice par exercice |
| `version_programme` | version de `programme.json` en vigueur |

Un exemple produit par les tests se trouve dans `captures/exemple-coach-historique-*.csv` (non publié).

L'historique est stocké dans l'iPhone (localStorage de l'app). Exporte-le au moins une fois par mois :
c'est ta sauvegarde.

---

## Publier sur GitHub Pages

`gh` n'est pas installé sur ce Mac, donc on passe par le site pour créer le dépôt.

1. Sur https://github.com/new : nom **`coach`**, **Public**, ne coche rien.
2. Dans le Terminal :

```bash
cd ~/PortfolioOS/coach
```

```bash
git init -b main
```

```bash
git add index.html sw.js manifest.webmanifest programme.json icon-180.png icon-192.png icon-512.png README.md .nojekyll .gitignore
```

```bash
git commit -m "Coach : programme hebdomadaire guidé"
```

```bash
git remote add origin https://github.com/TON-UTILISATEUR/coach.git
```

```bash
git push -u origin main
```

3. Sur GitHub : **Settings › Pages › Build and deployment › Source : Deploy from a branch ›
   Branch : `main` / `(root)` › Save**. Une à deux minutes plus tard : `https://TON-UTILISATEUR.github.io/coach/`.

Le dépôt est public : il contient le programme d'entraînement et les objectifs, mais aucune donnée de
santé. Ne mets jamais d'export Apple Santé ni de CSV d'historique dans ce dossier (`captures/` et les
`*.csv` sont exclus par `.gitignore`).

### Installer sur l'iPhone

Safari › ouvre l'URL › Partager › **Sur l'écran d'accueil** › « Coach ». L'app s'ouvre en plein écran
et fonctionne hors ligne après le premier chargement (sans météo, donc séance en intérieur).
Utilise toujours la même entrée (l'icône **ou** Safari) : sur iOS, elles ont chacune leur propre historique.

---

## Lancer l'AirPlay sur l'Apple TV

1. Allume l'Apple TV (même Wi-Fi que l'iPhone).
2. Active un mode de concentration (ex. **Sport**) pour que les notifications n'apparaissent pas à l'écran.
3. Ouvre **Coach**, déverrouille la rotation et tourne l'iPhone **en paysage** : la mise en page
   paysage est conçue pour la recopie (testée en 844 × 390 et 932 × 430).
4. Centre de contrôle › **Recopie de l'écran** › choisis l'Apple TV.
5. Appuie sur **Démarrer** : ce premier appui débloque aussi la voix sur iOS. Voix et bips sortent sur le téléviseur.
6. Pose le téléphone : la séance s'enchaîne seule. *Pause*, *Passer* et *Arrêter* restent disponibles.

Écran allumé : vidéo muette d'une seconde en boucle + Wake Lock. **Si l'écran s'éteint quand même :
Réglages › Luminosité et affichage › Verrouillage automatique › Jamais** (pense à le remettre ensuite).
Pas de son : vérifie le bouton « Son » de l'app, le volume de l'Apple TV et le commutateur silencieux.
Meilleure voix française : Réglages › Accessibilité › Contenu énoncé › Voix › Français.

## Automatisation Raccourcis (facultatif)

Rappel du soir pour préparer le lendemain : Raccourcis › **Automatisation** › **+** › **Heure de la
journée** › 21 h 00, tous les jours › **Exécuter immédiatement** › action **Ouvrir les URL** avec
`https://TON-UTILISATEUR.github.io/coach/`. La carte « Demain » s'affiche en premier après 18 h et
donne l'heure de lever. Tu peux ensuite régler ton réveil à la main ; la page ne peut pas le faire elle-même.

La recopie AirPlay ne se déclenche pas de façon fiable par un Raccourci : lance-la depuis le Centre de contrôle.

## Ce que l'app ne fait pas

- **Aucune intégration Apple Santé / HealthKit** : c'est impossible depuis une page web. Rien n'est
  lu ni écrit dans Santé. L'analyse santé se fait chaque mois à partir de l'export Apple Santé et du
  CSV de Coach, en dehors de l'app.
- Pas de minuteur de sauna, pas de notifications push, pas de compte, pas de serveur, pas de base de données.
- Aucun exercice hors programme, aucune série sous 12 répétitions, aucune suggestion de charge, aucun saut.

### Durées réelles

Avec 15 à 17 séries et des repos de 60 s (même exercice) / 75 s (changement d'exercice), la séance A
dure **≈ 32 min**, la B **≈ 38 min**, l'intensité ≈ 34 min, la séance du soir 9 min.
Le minuteur de série compte ~3 s par répétition au bas de la fourchette (5 s pour les mollets
excentriques) + 10 s de mise en place ; « Passer » si tu finis plus tôt.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | L'application complète |
| `programme.json` | Programme et objectifs, à redéfinir après chaque analyse |
| `manifest.webmanifest`, `icon-*.png` | Ajout à l'écran d'accueil, nom court « Coach » |
| `sw.js` | Fonctionnement hors ligne (un service worker doit être un fichier séparé) |
| `.nojekyll` | Sert les fichiers tels quels sur GitHub Pages |

## Tests effectués (Playwright, Chromium)

47 vérifications OK. Elles couvrent :
- les captures en 1280 × 720 et 390 × 844 ;
- la recopie paysage en 844 × 390 et 932 × 430, sans chevauchement avec la bande ;
- l'absence de tout terme de santé dans la page ;
- les dessins pendant les séries et les repos ;
- le programme du mardi (marche puis « Sauna fait ✓ ») et le dimanche de repos ;
- l'heure de lever (7 h 13 ; 6 h 43 avec une fin à 7 h 30 ; 6 h 40 le jeudi, marche + sauna) ;
- un `programme.json` modifié (intensité, jours de sauna, repos ramené à 60 s) ou absent ;
- la météo en échec, sans réponse (bascule à 3 s), sous la pluie et de nuit ; la fenêtre VTT, les UV et la boue ;
- l'alternance A/B/A après rechargement, la séance libre et le bilan 3/3 ;
- l'export CSV (une ligne par exercice, séries faites, séance interrompue) ;
- le chargement hors ligne.

Non testé sur un vrai iPhone ni sur l'Apple TV : voix iOS, recopie AirPlay, maintien de l'écran, feuille de partage.

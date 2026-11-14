# 🐴 Écuries de la Loire – Nantes

Prototype React de la PWA mobile de gestion d'une écurie de propriétaires :
planning des prestations, inscriptions, gestion des crédits, demandes à la carte et espace gérant.

## 🌐 Version en ligne

https://jdwd.github.io/ecuries-pwa/

Site statique compilé (données fictives) — déploiement automatique à chaque push sur `main` (GitHub Actions).
Relance manuelle possible : onglet **Actions** → workflow *Deploy to GitHub Pages* → **Run workflow**.

## 🚀 Lancer le projet en local

    npm install
    npm run dev

Puis ouvrir http://localhost:5173 — l'interface est pensée mobile (format téléphone).

## 🧱 Stack

- React 18 + Vite 5
- Tailwind CSS 3
- Typographie : Miso (titres) + Karrik (corps), chargées en webfont avec repli système
- Données mockées en mémoire (pas de backend)

## ✨ Fonctionnalités du prototype

- **Planning** : vues Liste / Agenda Jour / Agenda Semaine, filtres par type, point rose sur les jours où l'utilisateur est inscrit
- **Prestations** : monte, longe, soins crinière, tonte, soins des pieds, cours collectif et particulier (capacité max)
- **Règles métier** : fermeture des créneaux sans inscription la veille, décompte / recrédit des unités
- **Demandes à la carte** : le client demande une prestation, le gérant accepte (créneau créé + inscrit) ou refuse
- **Compte** : infos, chevaux & pensions, crédits, historique de consommation
- **Espace gérant** : semaines types (modèles normal / vacances), initialisation d'une semaine sur modèle ou vide, ajustement manuel (ajout / suppression de créneaux), unités de vente, tarifs, annonces, décalage de créneaux avec notification ciblée
- **Notifications** : annonces écurie + alertes prioritaires de décalage, badge de non-lus

## 👥 Comptes de démonstration

Bascule d'utilisateur via l'avatar en haut à droite :

- **Sophie Martin** — gérante
- **Justine Dewilde** — propriétaire (Ulysse)
- **Léa Bernard** — propriétaire + demi-pension (Ulysse)
- **Marc Dubois** — propriétaire (Jazz)
- **Camille Roger** — propriétaire (Vanille)

Semaine de démonstration : du 16 au 29 novembre 2026 (aujourd'hui : samedi 14 novembre 2026).

## 🗺️ Roadmap

- [ ] Backend : Supabase (auth, données réelles)
- [ ] Migration Nuxt 3 + @vite-pwa/nuxt pour une PWA installable
- [ ] Auto-hébergement des polices Miso / Karrik

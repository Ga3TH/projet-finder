# Finder

Application de réservation de chambres d'hôtel pour le groupement **Amor,
Byzance et Caraïbes**, réalisée en BTS SIO.

Ce README suffit pour installer, lancer, tester et comprendre le projet sur
n'importe quel poste Windows. Suis les sections dans l'ordre.

## Sommaire

1. [Présentation](#1-présentation)
2. [Technologies](#2-technologies)
3. [Installation rapide](#3-installation-rapide)
4. [Installation pas à pas](#4-installation-pas-à-pas)
   - [4.1 Prérequis](#41-prérequis)
   - [4.2 Cloner le dépôt](#42-cloner-le-dépôt)
   - [4.3 Installer les dépendances](#43-installer-les-dépendances)
   - [4.4 Créer la base MySQL](#44-créer-la-base-mysql)
   - [4.5 Configurer l'API](#45-configurer-lapi)
   - [4.6 Créer les tables et charger les données](#46-créer-les-tables-et-charger-les-données)
5. [Lancer l'application](#5-lancer-lapplication)
6. [Tester le projet](#6-tester-le-projet)
7. [Utiliser l'application](#7-utiliser-lapplication)
   - [7.1 Comptes de démonstration](#71-comptes-de-démonstration)
   - [7.2 Recherche dans le frontend](#72-recherche-dans-le-frontend)
   - [7.3 Routes protégées avec Swagger](#73-routes-protégées-avec-swagger)
8. [Référence de l'API](#8-référence-de-lapi)
9. [Référence du frontend](#9-référence-du-frontend)
   - [9.1 Fonctionnement](#91-fonctionnement)
   - [9.2 Composants](#92-composants)
   - [9.3 Validation et messages](#93-validation-et-messages)
   - [9.4 Configuration](#94-configuration)
   - [9.5 Build et prévisualisation](#95-build-et-prévisualisation)
   - [9.6 Faire évoluer le frontend](#96-faire-évoluer-le-frontend)
10. [Base de données](#10-base-de-données)
11. [Structure du projet](#11-structure-du-projet)
12. [Commandes utiles](#12-commandes-utiles)
13. [Problèmes courants](#13-problèmes-courants)
14. [Documentation complémentaire](#14-documentation-complémentaire)

---

## 1. Présentation

Finder permet de :

- consulter les **3 hôtels** et leurs **32 chambres** ;
- rechercher une chambre par hôtel, dates, nombre de personnes, prix maximal
  et catégorie ;
- créer un compte et se connecter (jeton JWT valable 24 h) ;
- pour un **voyageur** : réserver une chambre, voir et annuler ses
  réservations ;
- pour un **hôtelier** : gérer les chambres de son hôtel, accepter ou refuser
  les réservations reçues.

Le dépôt contient **deux applications indépendantes**, à lancer chacune dans
son terminal :

```text
Navigateur ──► front/ (React + Vite)  http://localhost:5173
                   │  fetch
                   ▼
               api/  (Express)        http://localhost:3000
                   │  Prisma
                   ▼
               MySQL (base finder_local, port 3306)
```

## 2. Technologies

| Partie | Outils |
| --- | --- |
| API | Node.js, Express 5, Prisma 6, MySQL 8, JWT, bcrypt, Zod, Swagger |
| Frontend | React 19, Vite 8, oxlint |
| Tests | Vitest, Supertest (53 tests d'intégration) |

## 3. Installation rapide

Pour ceux qui ont déjà Node.js 24, Git et MySQL démarré (sinon passe à la
[section 4](#4-installation-pas-à-pas)) :

```powershell
git clone https://github.com/Ga3TH/projet-finder.git
cd projet-finder\api
npm ci
Copy-Item .env.example .env       # puis vérifier DATABASE_URL et JWT_SECRET
npx prisma generate
npx prisma migrate deploy         # la base finder_local doit exister
npm run db:seed
npm test
cd ..\front
npm ci
```

Puis `npm run dev` dans `api`, `npm run dev` dans `front` (deux terminaux),
et ouvre <http://localhost:5173>.

---

## 4. Installation pas à pas

Les commandes sont à taper dans **PowerShell**. Les exemples utilisent MySQL
de Laragon avec l'utilisateur `root` sans mot de passe ; adapte-les si ton
installation est différente.

### 4.1 Prérequis

| Logiciel | Version | Téléchargement |
| --- | --- | --- |
| Node.js (inclut npm) | **24 LTS** recommandé, 22.12 minimum | <https://nodejs.org/> |
| Git | récent | <https://git-scm.com/download/win> |
| MySQL | 8 | inclus dans [Laragon](https://laragon.org/download/) (avec HeidiSQL) |
| Éditeur | facultatif | [Visual Studio Code](https://code.visualstudio.com/) |

> **Version de Node :** prends une version **paire** (22.12+, 24 ou 26).
> Vitest refuse Node 23 et 25.

Après l'installation, **ferme et rouvre PowerShell**, puis vérifie :

```powershell
node --version    # v24.x (ou v22.12+)
npm --version
git --version
```

**Autoriser npm dans PowerShell.** Sur un poste neuf, PowerShell bloque
souvent `npm` et `npx` (*« l'exécution de scripts est désactivée sur ce
système »*). Pour l'autoriser pour ton compte :

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Si tu n'en as pas le droit, tape `npm.cmd` et `npx.cmd` à la place de `npm`
et `npx` dans tout ce guide.

### 4.2 Cloner le dépôt

Choisis un dossier de travail (ici `C:\dev`, n'importe lequel convient) :

```powershell
New-Item -ItemType Directory -Force C:\dev
Set-Location C:\dev
git clone https://github.com/Ga3TH/projet-finder.git
Set-Location projet-finder
```

Dans la suite, **la racine** désigne ce dossier `projet-finder`.

### 4.3 Installer les dépendances

`api` et `front` ont chacun leur `package.json` ; **il n'y a rien à installer
à la racine**. Depuis la racine :

```powershell
cd api
npm ci
cd ..\front
npm ci
cd ..
```

`npm ci` installe exactement les versions des `package-lock.json`, donc la
même chose sur tous les postes.

Ces messages pendant l'installation de l'API sont **normaux** :

- `npm warn install-scripts ... @scarf/scarf` : statistique d'usage de
  Swagger, volontairement non autorisée ;
- `npm audit` qui signale des vulnérabilités : ne lance **pas**
  `npm audit fix --force`, il change des versions majeures et casse le projet.

### 4.4 Créer la base MySQL

1. Ouvre Laragon et clique sur **Démarrer tout** (ou démarre seulement MySQL).
2. Crée la base, au choix :
   - dans **HeidiSQL** (bouton **Base de données** de Laragon) :

     ```sql
     CREATE DATABASE IF NOT EXISTS finder_local
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci;
     ```

   - ou dans le **Terminal** de Laragon :

     ```powershell
     mysql -u root -e "CREATE DATABASE IF NOT EXISTS finder_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
     ```

Utilise une base dédiée au projet : le seed et les tests écrivent dedans.

### 4.5 Configurer l'API

Crée `api/.env` à partir du modèle et ouvre-le :

```powershell
cd api
Copy-Item .env.example .env
notepad .env
```

Contenu pour MySQL local avec `root` sans mot de passe :

```dotenv
PORT=3000
DATABASE_URL="mysql://root@127.0.0.1:3306/finder_local"
JWT_SECRET="colle-ici-une-longue-cle-aleatoire"
FRONTEND_ORIGIN="http://localhost:5173"
```

| Variable | Rôle |
| --- | --- |
| `PORT` | Port de l'API. Garde `3000` : le frontend l'attend dans `front/src/config.js`. |
| `DATABASE_URL` | Connexion MySQL : `mysql://utilisateur:motdepasse@hôte:port/base`. |
| `JWT_SECRET` | Clé qui signe les jetons de connexion. Obligatoire. |
| `FRONTEND_ORIGIN` | Adresse du frontend autorisée par CORS. |

Pour générer une `JWT_SECRET` aléatoire :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Si MySQL a un mot de passe :
`mysql://root:motdepasse@127.0.0.1:3306/finder_local`. Encode les caractères
spéciaux du mot de passe (`@` → `%40`, `#` → `%23`, `:` → `%3A`).

`api/.env` est ignoré par Git : ne le commite jamais et ne le partage pas.

### 4.6 Créer les tables et charger les données

MySQL démarré et `.env` enregistré, depuis `api` :

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

| Commande | Effet | Résultat attendu |
| --- | --- | --- |
| `npx prisma generate` | Génère le client Prisma | `Generated Prisma Client` |
| `npx prisma migrate deploy` | Crée les tables (3 migrations) | `All migrations have been successfully applied.` |
| `npm run db:seed` | Charge `api/finder-data/` | `3 hôtels, 32 chambres, 9 comptes, 8 réservations` |

> **Attention :** le seed **vide puis recharge** les tables Finder. Relance-le
> quand tu veux revenir aux données de départ, mais jamais sur une base qui
> contient des données à garder.

---

## 5. Lancer l'application

Il faut **deux terminaux PowerShell** ouverts en même temps, et MySQL démarré.

**Terminal 1 — API**, depuis `api` :

```powershell
npm run dev
```

Le terminal affiche `API sur http://localhost:3000`. Vérifie :

| Adresse | Attendu |
| --- | --- |
| <http://localhost:3000/health> | `{"statut":"ok"}` (l'API tourne) |
| <http://localhost:3000/hotels> | les 3 hôtels (la base répond) |
| <http://localhost:3000/docs> | la documentation Swagger |

**Terminal 2 — frontend**, depuis `front` :

```powershell
npm run dev
```

Ouvre l'adresse affichée par Vite, normalement <http://localhost:5173>.

Pour arrêter un serveur : **Ctrl+C** dans son terminal. Les fois suivantes,
il suffit de démarrer MySQL puis de relancer les deux `npm run dev`.

## 6. Tester le projet

**API**, depuis `api` (MySQL démarré, seed chargé) :

```powershell
npm run check          # syntaxe JavaScript
npm test               # 53 tests Vitest/Supertest
npm run test:coverage  # tests + couverture de code
```

Tous les tests doivent passer. Ils appellent les vraies routes avec la base
de `DATABASE_URL` et suppriment les comptes et réservations qu'ils créent.
La recette (TA-001 à TA-010) est décrite dans [docs/recette.md](docs/recette.md).

**Frontend**, depuis `front` :

```powershell
npm run lint     # aucune erreur attendue
npm run build    # produit front/dist
```

---

## 7. Utiliser l'application

### 7.1 Comptes de démonstration

Créés par le seed (liste complète dans `api/finder-data/comptes.json`) :

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Hôtelier (Amor) | `ravel@amor.example` | `Amor-2026!` |
| Hôtelier (Byzance) | `bianchi@byzance.example` | `Byzance-2026!` |
| Hôtelier (Caraïbes) | `toussaint@caraibes.example` | `Caraibes-2026!` |
| Voyageur | `a.morel@mail.example` | `Voyage-2026!` |
| Admin | `admin@sentinox.example` | `Admin-2026!` |

Les autres voyageurs (`k.diallo`, `s.nguyen`, `p.lefebvre`, `m.haddad`
`@mail.example`) ont aussi le mot de passe `Voyage-2026!`.

### 7.2 Recherche dans le frontend

Avec l'API et le frontend démarrés, ce parcours vérifie que tout fonctionne :

1. À l'ouverture, les **32 chambres** s'affichent.
2. **Hôtel** = `Amor`, puis **Rechercher** : la fiche Amor apparaît avec ses
   12 chambres.
3. Clique sur une chambre : sa fiche affiche numéro, catégorie, capacité,
   prix, description et hôtel. **Fermer** la masque.
4. **Personnes** = 4 et **Prix max.** = 120 : seules les chambres
   correspondantes restent.
5. Un hôtel inconnu ou un filtre sans résultat affiche un message, sans page
   blanche.
6. Une seule date, ou des dates dans le mauvais ordre : le formulaire affiche
   une erreur et n'envoie pas de requête.
7. Arrête l'API (Ctrl+C) et relance une recherche : un message indique que
   l'API ne répond pas. Redémarre-la ensuite.

Les dates d'arrivée et de départ doivent être toutes deux renseignées ou
toutes deux vides.

### 7.3 Routes protégées avec Swagger

1. Ouvre <http://localhost:3000/docs>, puis `POST /auth/login` →
   **Try it out**.
2. Saisis `email` et `motDePasse` d'un compte de démonstration → **Execute**.
3. Copie le champ `token` de la réponse, clique sur **Authorize**.
4. Colle le token **sans** ajouter `Bearer` (Swagger l'ajoute lui-même).

Les routes protégées sont alors utilisables selon le rôle du compte.

---

## 8. Référence de l'API

Adresse de base : `http://localhost:3000`. Le détail de chaque route (corps,
réponses) est dans Swagger : <http://localhost:3000/docs>.

| Méthode | Route | Accès | Description |
| --- | --- | --- | --- |
| GET | `/health` | public | État de l'API |
| GET | `/hotels` | public | Liste des hôtels |
| GET | `/hotels/:id` | public | Fiche d'un hôtel |
| GET | `/hotels/:id/chambres` | public | Chambres d'un hôtel |
| GET | `/chambres` | public | Recherche de chambres (filtres ci-dessous) |
| GET | `/chambres/:id` | public | Fiche d'une chambre |
| POST | `/chambres` | hôtelier | Ajouter une chambre |
| PATCH | `/chambres/:id` | hôtelier | Modifier une chambre |
| DELETE | `/chambres/:id` | hôtelier | Supprimer une chambre |
| POST | `/auth/register` | public | Créer un compte |
| POST | `/auth/login` | public | Se connecter (renvoie `token`) |
| GET | `/me` | connecté | Compte connecté |
| GET | `/voyageurs/me` | voyageur | Profil voyageur |
| PATCH | `/voyageurs/me` | voyageur | Modifier son profil |
| POST | `/reservations` | voyageur | Réserver une chambre |
| GET | `/reservations/mine` | voyageur | Mes réservations |
| DELETE | `/reservations/:id` | voyageur | Annuler une réservation |
| GET | `/reservations/received` | hôtelier | Réservations reçues |
| PATCH | `/reservations/:id` | hôtelier | Changer le statut d'une réservation |
| GET | `/admin/secret` | admin | Route de test du rôle admin |

**Filtres de `GET /chambres`** (tous facultatifs, combinables) :

| Paramètre | Exemple | Effet |
| --- | --- | --- |
| `hotel` | `hotel=Amor` ou `hotel=1` | Nom (partiel) ou identifiant de l'hôtel |
| `prix_max` | `prix_max=89` | Prix par nuit inférieur ou égal |
| `capacite` | `capacite=4` | Nombre de personnes exact |
| `categorie` | `categorie=suite` | `simple`, `double`, `familiale` ou `suite` |
| `date_debut` et `date_fin` | `date_debut=2026-12-01&date_fin=2026-12-05` | Chambres libres sur la période |

Exemple : <http://localhost:3000/chambres?hotel=Amor&prix_max=120>

**Conventions :**

- routes protégées : en-tête `Authorization: Bearer <token>` ;
- sans jeton : `401` ; mauvais rôle : `403` ; corps invalide : `400` ;
  identifiant inconnu : `404` ;
- toute erreur renvoie un JSON de la forme `{ "erreur": "..." }` ;
- statuts de réservation : `en_attente`, `confirmee`, `refusee`, `annulee`.

## 9. Référence du frontend

Le frontend est une application React créée avec Vite, dans `front/`. Il ne
contient aucune donnée : tout vient de l'API.

État d'avancement (voir [docs/SPEC.md](docs/SPEC.md)) :

| Étape du Sprint 2 | État |
| --- | --- |
| E1 Socle React/Vite, adresse de l'API centralisée | fait |
| E2 Recherche de chambres avec filtres et fiches | fait |
| E3 Inscription et connexion | à faire |

### 9.1 Fonctionnement

```text
index.html ──► src/main.jsx ──► src/App.jsx
                                   ├── FormulaireRecherche   (saisie des filtres)
                                   ├── FicheHotel            (si un hôtel est recherché)
                                   ├── ListeChambres         (résultats)
                                   └── FicheChambre          (chambre sélectionnée)
```

`App.jsx` garde tout l'état de la page (critères saisis, résultats, chambre
sélectionnée, chargement, erreurs) et le transmet aux composants par leurs
props. À chaque recherche :

1. les critères non vides deviennent des paramètres d'URL, par exemple
   `GET /chambres?hotel=Amor&prix_max=120` ;
2. si le champ **Hôtel** est rempli, `GET /hotels` est aussi appelé pour
   afficher la fiche de l'hôtel trouvé (par identifiant ou par nom partiel) ;
3. si une nouvelle recherche part avant la fin de la précédente, l'ancienne
   est annulée (`AbortController`), donc les résultats ne se mélangent pas.

Au chargement de la page, une recherche sans filtre affiche les 32 chambres.

### 9.2 Composants

Tous dans `front/src/composants/` :

| Composant | Rôle | Props |
| --- | --- | --- |
| `FormulaireRecherche` | Champs Hôtel, Arrivée, Départ, Personnes, Prix max., Catégorie et bouton **Rechercher** | `criteres`, `onChanger`, `onRechercher` |
| `ListeChambres` | Nombre de résultats et liste cliquable des chambres | `chambres`, `chambreSelectionneeId`, `onSelectionner` |
| `FicheChambre` | Détail d'une chambre et bouton **Fermer** | `chambre`, `hotel`, `onFermer` |
| `FicheHotel` | Nom, adresse, ville et description d'un hôtel | `hotel` |

Les champs du formulaire portent les mêmes noms que les paramètres de l'API
(`hotel`, `date_debut`, `date_fin`, `capacite`, `prix_max`, `categorie`) :
voir les [filtres de `GET /chambres`](#8-référence-de-lapi).

### 9.3 Validation et messages

Avant d'envoyer la requête, le formulaire vérifie les dates :

| Saisie | Message |
| --- | --- |
| Une seule date renseignée | *Renseignez les deux dates ou laissez-les vides.* |
| Arrivée le même jour ou après le départ | *La date d'arrivée doit précéder la date de départ.* |

Messages affichés ensuite :

| Situation | Affichage |
| --- | --- |
| Requête en cours | *Chargement des chambres…* |
| Aucun résultat | *Aucune chambre à afficher.* |
| Hôtel recherché introuvable | *Aucun hôtel ne correspond à « … ».* |
| L'API renvoie une erreur | le message `erreur` renvoyé par l'API |
| API arrêtée ou bloquée par CORS | *Impossible de joindre l'API à http://localhost:3000…* |

### 9.4 Configuration

L'adresse de l'API est définie à un seul endroit,
[front/src/config.js](front/src/config.js) :

```js
export const API = 'http://localhost:3000'
```

Si tu changes le port de l'API (`PORT` dans `api/.env`), change aussi cette
ligne. Dans l'autre sens, l'API n'accepte qu'**une** origine de frontend :
celle de `FRONTEND_ORIGIN` dans `api/.env`. Si le frontend tourne sur une
autre adresse, mets-la dans `FRONTEND_ORIGIN` et redémarre l'API.

### 9.5 Build et prévisualisation

```powershell
npm run build     # crée la version optimisée dans front/dist
npm run preview   # sert front/dist sur http://localhost:4173
```

`npm run preview` utilise le port **4173**, pas 5173 : pour qu'il puisse
appeler l'API, mets temporairement
`FRONTEND_ORIGIN="http://localhost:4173"` dans `api/.env` et redémarre l'API
(remets `5173` ensuite).

### 9.6 Faire évoluer le frontend

- un nouveau composant va dans `front/src/composants/`, un fichier par
  composant, nommé en PascalCase (`FormulaireConnexion.jsx`) ;
- les appels à l'API utilisent toujours `API` importé de `./config.js`, jamais
  une adresse écrite en dur ;
- les routes protégées (par exemple pour l'étape E3) attendent l'en-tête
  `Authorization: Bearer <token>`, avec le `token` renvoyé par
  `POST /auth/login` ;
- lance `npm run lint` et `npm run build` avant de commiter.

## 10. Base de données

Schéma : [api/prisma/schema.prisma](api/prisma/schema.prisma).

| Table | Contenu | Liens |
| --- | --- | --- |
| `hotel` | Les 3 hôtels | — |
| `chambre` | Les 32 chambres (numéro unique dans un hôtel) | → `hotel` |
| `compte` | Voyageurs, hôteliers, admin (mots de passe hachés avec bcrypt) | → `hotel` pour un hôtelier |
| `reservation` | Réservations avec dates et statut | → `chambre`, → `compte` |

Les données de départ viennent de `api/finder-data/` (à ne pas modifier) et
sont chargées par [api/prisma/seed.js](api/prisma/seed.js).

Pour explorer la base : HeidiSQL (Laragon) ou `npx prisma studio` depuis `api`.

## 11. Structure du projet

```text
projet-finder/
├── api/                    API Express
│   ├── src/
│   │   ├── server.js       démarrage du serveur
│   │   ├── app.js          configuration Express, CORS, Swagger
│   │   ├── routes/         une route par fichier (hotels, chambres, auth…)
│   │   ├── middlewares.js  authentification JWT, rôles, validation
│   │   ├── schemas.js      schémas Zod
│   │   └── prisma.js       client Prisma partagé
│   ├── prisma/             schéma, migrations, seed
│   ├── finder-data/        données de démonstration (JSON)
│   ├── tests/              tests Vitest/Supertest
│   └── .env.example        modèle de configuration
├── front/                  interface React/Vite
│   └── src/
│       ├── App.jsx         page principale et appels à l'API
│       ├── composants/     formulaire, listes et fiches
│       └── config.js       adresse de l'API
└── docs/                   spécification, architecture, recette, décisions
```

## 12. Commandes utiles

| Dossier | Commande | Utilité |
| --- | --- | --- |
| `api` | `npm run dev` | Démarrer l'API avec rechargement automatique |
| `api` | `npm start` | Démarrer l'API sans rechargement |
| `api` | `npm test` | Lancer les tests |
| `api` | `npm run test:coverage` | Tests avec couverture |
| `api` | `npm run check` | Vérifier la syntaxe |
| `api` | `npm run db:seed` | Remettre les données de départ |
| `api` | `npx prisma migrate deploy` | Appliquer les migrations |
| `api` | `npx prisma studio` | Explorer la base dans le navigateur |
| `front` | `npm run dev` | Démarrer l'interface |
| `front` | `npm run lint` | Vérifier le code |
| `front` | `npm run build` | Construire dans `front/dist` |
| `front` | `npm run preview` | Prévisualiser le build |

## 13. Problèmes courants

| Symptôme | Cause et solution |
| --- | --- |
| `npm` ou `node` n'est pas reconnu | Node.js absent, ou terminal ouvert avant l'installation. Ferme tous les terminaux (et VS Code) puis rouvre-les. |
| *L'exécution de scripts est désactivée* | Voir [4.1 Prérequis](#41-prérequis) : `Set-ExecutionPolicy`, ou `npm.cmd` / `npx.cmd`. |
| `EBADENGINE`, Vitest ou Vite refuse de démarrer | Mauvaise version de Node. Installe Node 24 LTS, supprime `node_modules` dans `api` et `front`, relance `npm ci`. |
| `Can't reach database server at 127.0.0.1:3306` | MySQL n'est pas démarré : lance-le dans Laragon. Typique : `/health` répond mais `/hotels` renvoie une erreur 500. |
| `Access denied for user` ou `Unknown database` | `DATABASE_URL` est faux : vérifie utilisateur, mot de passe (encodé), port et que `finder_local` existe. |
| Prisma signale des tables absentes | Depuis `api` : `npx prisma migrate deploy` puis `npm run db:seed`. |
| `@prisma/client did not initialize yet` | Lance `npx prisma generate` depuis `api`. |
| Tests : *La base DATABASE_URL ne contient pas les données de démonstration* | Lance `npm run db:seed` depuis `api`, puis `npm test`. |
| Frontend : *Impossible de joindre l'API* | L'API doit tourner (terminal 1) et `FRONTEND_ORIGIN` doit être exactement l'adresse de Vite. Redémarre l'API après toute modification de `.env`. |
| `EADDRINUSE` (port déjà utilisé) | `Get-NetTCPConnection -LocalPort 3000 -State Listen` donne le `OwningProcess`, puis `Stop-Process -Id <numéro>`. |
| Vite démarre sur un autre port que 5173 | Mets cette adresse dans `FRONTEND_ORIGIN` et redémarre l'API. |

## 14. Documentation complémentaire

- [docs/SPEC.md](docs/SPEC.md) : spécification et avancement des sprints ;
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : architecture de l'API ;
- [docs/recette.md](docs/recette.md) : tests d'acceptation TA-001 à TA-010 ;
- [docs/decisions/](docs/decisions/) : décisions techniques (ex. frontend
  séparé de l'API) ;
- [api/finder-data/README.md](api/finder-data/README.md) : description des
  données de démonstration.

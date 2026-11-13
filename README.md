# Finder

Application de réservation de chambres pour les hôtels Amor, Byzance et
Caraïbes. Le dépôt contient deux applications à installer et lancer
séparément :

- `api/` : API Express, base MySQL et Prisma (port `3000`) ;
- `front/` : interface React/Vite qui appelle l'API (port `5173`).

Ce guide part d'un poste **Windows vierge** et va jusqu'à l'application qui
tourne, testée et vérifiée. Les commandes sont à taper dans **PowerShell**.
Les exemples utilisent MySQL local (Laragon) avec l'utilisateur `root` sans mot
de passe ; adapte les valeurs si ton installation diffère.

## Installation express

Si les prérequis (section 1) sont déjà en place et MySQL est démarré :

```powershell
git clone https://github.com/Ga3TH/projet-finder.git
cd projet-finder\api
npm ci
Copy-Item .env.example .env          # puis vérifier DATABASE_URL et JWT_SECRET
npx prisma generate
npx prisma migrate deploy            # la base finder_local doit exister
npm run db:seed
npm test
cd ..\front
npm ci
```

Lancement : `npm run dev` dans `api`, puis `npm run dev` dans `front` (deux
terminaux), et ouvre <http://localhost:5173>. Le détail de chaque étape suit.

## 1. Prérequis

### Logiciels

| Logiciel | Version | Lien |
| --- | --- | --- |
| Node.js (avec npm) | **24 LTS** recommandé (22.12 minimum) | <https://nodejs.org/> |
| Git | récent | <https://git-scm.com/download/win> |
| MySQL | 8 | inclus dans [Laragon](https://laragon.org/download/) (avec HeidiSQL) |

Visual Studio Code est facultatif.

> **Version de Node :** prends une version **paire** (22.12+, 24 ou 26).
> Vitest refuse Node 23 et 25, et Vite demande au moins 22.12.

### Vérifier l'installation

Après avoir installé Node.js et Git, **ferme et rouvre PowerShell** (sinon les
nouvelles commandes ne sont pas trouvées), puis :

```powershell
node --version    # v24.x attendu (ou v22.12+)
npm --version
git --version
```

### Autoriser npm dans PowerShell

Sur un poste neuf, PowerShell bloque souvent `npm` et `npx` avec une erreur
du type *« l'exécution de scripts est désactivée sur ce système »*. Pour
l'autoriser une fois pour toutes pour ton compte :

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Sans droits suffisants, utilise plutôt `npm.cmd` et `npx.cmd` à la place de
`npm` et `npx` dans toutes les commandes de ce guide.

## 2. Cloner le dépôt

Choisis un dossier de travail (ici `C:\dev`, n'importe quel dossier convient),
puis clone le dépôt :

```powershell
New-Item -ItemType Directory -Force C:\dev
Set-Location C:\dev
git clone https://github.com/Ga3TH/projet-finder.git
Set-Location projet-finder
```

Dans la suite, **la racine du dépôt** désigne ce dossier `projet-finder`. Les
dossiers `api` et `front` ont chacun leur propre `package.json` : il n'y a
**rien à installer à la racine**.

## 3. Installer les dépendances

Depuis la racine du dépôt :

```powershell
cd api
npm ci
cd ..\front
npm ci
cd ..
```

`npm ci` installe exactement les versions des fichiers `package-lock.json` :
c'est ce qui garantit la même installation sur tous les postes.

Pendant l'installation de l'API, ces messages sont **normaux** et ne bloquent
rien :

- `npm warn install-scripts ... @scarf/scarf` (statistique d'usage de Swagger,
  volontairement non autorisée) ;
- `npm audit` qui signale des vulnérabilités dans les dépendances de
  développement. Ne lance **pas** `npm audit fix --force` : il change des
  versions majeures et peut casser le projet.

## 4. Démarrer MySQL et créer la base

1. Ouvre Laragon et clique sur **Démarrer tout** (ou démarre seulement MySQL).
2. Crée la base, au choix :
   - dans **HeidiSQL** (bouton **Base de données** de Laragon), exécute :

     ```sql
     CREATE DATABASE IF NOT EXISTS finder_local
       CHARACTER SET utf8mb4
       COLLATE utf8mb4_unicode_ci;
     ```

   - ou dans le **Terminal** de Laragon :

     ```powershell
     mysql -u root -e "CREATE DATABASE IF NOT EXISTS finder_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
     ```

Utilise une base dédiée au projet : le seed (section 6) et les tests écrivent
dedans.

## 5. Configurer l'API

Crée le fichier `api/.env` à partir du modèle et ouvre-le :

```powershell
cd api
Copy-Item .env.example .env
notepad .env
```

Contenu attendu pour MySQL local avec `root` sans mot de passe :

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
| `JWT_SECRET` | Clé de signature des jetons de connexion. Obligatoire. |
| `FRONTEND_ORIGIN` | Adresse du frontend autorisée par CORS (Vite : `http://localhost:5173`). |

Pour générer une clé `JWT_SECRET` aléatoire :

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Si MySQL a un mot de passe, ajoute-le dans l'URL :
`mysql://root:motdepasse@127.0.0.1:3306/finder_local`. Les caractères
spéciaux du mot de passe doivent être encodés (`@` → `%40`, `#` → `%23`,
`:` → `%3A`).

`api/.env` est ignoré par Git : ne le commite jamais et ne le partage pas.

## 6. Créer les tables et charger les données

MySQL doit être démarré et `api/.env` enregistré. Depuis `api` :

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

| Commande | Effet | Résultat attendu |
| --- | --- | --- |
| `npx prisma generate` | Génère le client Prisma dans `node_modules` | `Generated Prisma Client` |
| `npx prisma migrate deploy` | Crée les tables (3 migrations) | `All migrations have been successfully applied.` |
| `npm run db:seed` | Charge `api/finder-data/` | `3 hôtels, 32 chambres, 9 comptes, 8 réservations` |

> **Attention :** le seed **vide puis recharge** les tables Finder de la base
> configurée. Ne le lance que sur une base de développement.

Le seed peut être relancé à tout moment pour revenir aux données de départ.

## 7. Vérifier l'installation

### API

Depuis `api`, MySQL démarré et seed chargé :

```powershell
npm run check     # syntaxe JavaScript
npm test          # 53 tests Vitest/Supertest
```

Tous les tests doivent passer. Ils utilisent la vraie base de `DATABASE_URL`
avec les données du seed, et suppriment les comptes et réservations qu'ils
créent. `npm run test:coverage` affiche en plus la couverture du code.

### Frontend

Depuis `front` :

```powershell
npm run lint      # aucune erreur attendue
npm run build     # produit front/dist
```

## 8. Démarrer l'application

Il faut **deux terminaux PowerShell** ouverts en même temps.

**Terminal 1 — API**, depuis `api` :

```powershell
npm run dev
```

Le terminal affiche `API sur http://localhost:3000`. Vérifie :

- <http://localhost:3000/health> → `{"statut":"ok"}` ;
- <http://localhost:3000/hotels> → la liste des 3 hôtels (prouve que la base
  répond) ;
- <http://localhost:3000/docs> → la documentation Swagger.

**Terminal 2 — frontend**, depuis `front` :

```powershell
npm run dev
```

Ouvre l'adresse affichée par Vite, normalement <http://localhost:5173>.
Pour arrêter un serveur, retourne dans son terminal et appuie sur **Ctrl+C**.

Pour les fois suivantes, il suffit de démarrer MySQL (Laragon) puis de lancer
les deux `npm run dev`.

## 9. Parcours de vérification de la recherche

Avec MySQL, l'API et le frontend démarrés :

1. À l'ouverture du frontend, le chargement se termine et les **32 chambres**
   apparaissent.
2. Renseigne `Amor` dans **Hôtel** et clique sur **Rechercher** : la fiche
   Amor apparaît au-dessus des résultats, qui contiennent ses 12 chambres.
3. Sélectionne une chambre : sa fiche affiche numéro, catégorie, capacité,
   prix, description et hôtel. **Fermer** masque la fiche.
4. Filtre par **Personnes = 4** et **Prix max. = 120** : seules les chambres
   correspondantes s'affichent.
5. Essaie un nom d'hôtel inconnu ou un filtre sans résultat : un message
   explicite s'affiche, sans page blanche.
6. Saisis une seule date, ou des dates dans le mauvais ordre : le formulaire
   affiche une erreur et n'envoie pas de requête.
7. Arrête l'API (Ctrl+C) et relance une recherche : un message indique que
   l'API ne répond pas. Redémarre-la ensuite.

Les filtres disponibles sont l'hôtel (nom ou identifiant), les dates d'arrivée
et de départ, la capacité, le prix maximal par nuit et la catégorie. Les dates
doivent être toutes deux renseignées ou toutes deux vides.

## 10. Essayer une route protégée

Comptes de démonstration (tous dans `api/finder-data/comptes.json`) :

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Hôtelier (Amor) | `ravel@amor.example` | `Amor-2026!` |
| Voyageur | `a.morel@mail.example` | `Voyage-2026!` |
| Admin | `admin@sentinox.example` | `Admin-2026!` |

Dans Swagger (<http://localhost:3000/docs>) :

1. Ouvre `POST /auth/login` et clique sur **Try it out**.
2. Saisis `email` et `motDePasse` d'un compte ci-dessus, puis **Execute**.
3. Copie le champ `token` de la réponse et clique sur **Authorize**.
4. Colle le token **sans** ajouter `Bearer` (Swagger l'ajoute lui-même).

## Commandes utiles

| Dossier | Commande | Utilité |
| --- | --- | --- |
| `api` | `npm run dev` | Démarrer l'API avec rechargement automatique |
| `api` | `npm start` | Démarrer l'API sans rechargement |
| `api` | `npm test` | Lancer les tests de l'API |
| `api` | `npm run test:coverage` | Tests avec couverture de code |
| `api` | `npm run check` | Vérifier la syntaxe JavaScript |
| `api` | `npm run db:seed` | Recharger les données (remplace les données Finder) |
| `api` | `npx prisma migrate deploy` | Appliquer les migrations |
| `front` | `npm run dev` | Démarrer l'interface |
| `front` | `npm run lint` | Vérifier le code frontend |
| `front` | `npm run build` | Construire le frontend dans `front/dist` |
| `front` | `npm run preview` | Prévisualiser le build |

## Résoudre les problèmes courants

### `npm` ou `node` n'est pas reconnu

Node.js n'est pas installé, ou le terminal a été ouvert avant l'installation.
Ferme **tous** les terminaux (et VS Code), rouvre-les et relance
`node --version`.

### PowerShell bloque `npm.ps1` ou `npx.ps1`

Voir [Autoriser npm dans PowerShell](#autoriser-npm-dans-powershell), ou
utilise `npm.cmd` / `npx.cmd`.

### `EBADENGINE` ou Vitest/Vite refuse de démarrer

La version de Node ne convient pas. Installe Node 24 LTS (ou 22.12+), évite
les versions impaires (23, 25), puis supprime `node_modules` dans `api` et
`front` et relance `npm ci`.

### `Can't reach database server at 127.0.0.1:3306`

MySQL n'est pas démarré, ou n'écoute pas sur ce port. Démarre-le dans Laragon.
Symptôme typique : `/health` répond `{"statut":"ok"}` mais `/hotels` renvoie
une erreur 500, car `/health` n'utilise pas la base.

### `Access denied for user` ou `Unknown database`

`DATABASE_URL` ne correspond pas à ton MySQL : vérifie l'utilisateur, le mot
de passe (encodé), le port et que la base `finder_local` existe (section 4).

### Prisma indique que des tables sont absentes

Depuis `api`, relance `npx prisma generate` puis `npx prisma migrate deploy`,
puis `npm run db:seed`.

### `@prisma/client did not initialize yet`

Le client Prisma n'a pas été généré : lance `npx prisma generate` depuis `api`.

### Les tests échouent avec « La base DATABASE_URL ne contient pas les données de démonstration »

Le seed n'a pas été chargé dans cette base : lance `npm run db:seed` depuis
`api`, puis `npm test`.

### Le frontend affiche « Impossible de joindre l'API »

- l'API doit tourner sur <http://localhost:3000> (terminal 1) ;
- `FRONTEND_ORIGIN` dans `api/.env` doit être **exactement** l'adresse
  affichée par Vite (protocole, nom d'hôte et port) ;
- après toute modification de `.env`, redémarre l'API.

### Un port est déjà utilisé (`EADDRINUSE`)

Trouve le programme qui occupe le port, puis ferme-le :

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
Stop-Process -Id <numéro affiché>
```

Si Vite choisit un autre port que `5173`, mets cette adresse dans
`FRONTEND_ORIGIN` et redémarre l'API. Si tu changes le port de l'API, mets
aussi à jour `front/src/config.js`.

## Structure du projet

- `api/src/` — serveur Express, routes, middlewares et documentation OpenAPI ;
- `api/prisma/` — schéma, migrations et seed ;
- `api/finder-data/` — données de démonstration (ne pas modifier) ;
- `api/tests/` — tests de l'API (Vitest et Supertest) ;
- `front/src/` — interface React et ses composants ;
- `docs/` — spécification, architecture, recette et décisions.

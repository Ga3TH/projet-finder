# Finder

Application de réservation de chambres pour les hôtels Amor, Byzance et
Caraïbes. Le dépôt contient deux applications à lancer séparément :

- `api/` : API Express, base MySQL et Prisma ;
- `front/` : interface React/Vite qui appelle l'API.

Ce guide permet de cloner le dépôt, installer les dépendances, initialiser une
base locale, lancer les vérifications et essayer la recherche. Les exemples
utilisent **Windows et PowerShell**, MySQL local (par exemple Laragon) avec
l'utilisateur `root` sans mot de passe. Adapte les valeurs si ton installation
diffère.

## 1. Prérequis

Installe :

- [Node.js LTS](https://nodejs.org/) (Node 22.12 ou plus récent recommandé) ;
- [Git for Windows](https://git-scm.com/download/win) ;
- MySQL 8 et un outil pour l'administrer, par exemple
  [Laragon](https://laragon.org/download/) et HeidiSQL.

Visual Studio Code est facultatif. Après l'installation de Node.js et Git,
ouvre un nouveau PowerShell et vérifie les commandes :

```powershell
node --version
npm --version
git --version
```

Les trois commandes doivent afficher une version.

## 2. Cloner le dépôt

```powershell
New-Item -ItemType Directory -Force "$HOME\source"
Set-Location "$HOME\source"
git clone https://github.com/Ga3TH/projet-finder.git
Set-Location "$HOME\source\projet-finder"
```

Les dossiers `api` et `front` ont chacun leur propre `package.json` et doivent
être installés séparément. Il n'y a pas de commande d'installation à lancer à
la racine.

## 3. Installer les dépendances

Depuis la racine du dépôt, installe d'abord celles de l'API :

```powershell
cd api
npm ci
```

Puis celles du frontend :

```powershell
cd ..\front
npm install
cd ..
```

`npm ci` installe l'API exactement depuis son fichier lock ; `npm install`
installe le frontend et conserve son fichier lock à jour.

## 4. Créer la base MySQL

1. Démarre le service MySQL dans Laragon ou dans ton outil habituel.
2. Dans HeidiSQL (ou un client MySQL), exécute :

```sql
CREATE DATABASE finder_local
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Si la base existe déjà, ne la recrée pas. Utilise une base locale dédiée au
projet.

## 5. Configurer l'API

Crée le fichier local `api/.env` depuis le modèle, puis ouvre-le :

```powershell
Set-Location "$HOME\source\projet-finder\api"
Copy-Item .env.example .env
notepad .env
```

Pour MySQL local avec `root` sans mot de passe, les valeurs sont :

```dotenv
PORT=3000
DATABASE_URL="mysql://root@127.0.0.1:3306/finder_local"
JWT_SECRET="remplace-par-une-cle-secrete-locale"
FRONTEND_ORIGIN="http://localhost:5173"
```

`PORT` doit rester à `3000` pour correspondre à `front/src/config.js`.
`FRONTEND_ORIGIN` doit correspondre à l'adresse du frontend ; par défaut,
Vite utilise `http://localhost:5173`. N'enregistre jamais les vrais secrets
dans Git et ne partage pas `api/.env`.

Si MySQL utilise un mot de passe, ajoute-le à l'URL :
`mysql://root:motdepasse@127.0.0.1:3306/finder_local`. Les caractères spéciaux
du mot de passe doivent être encodés pour une URL (par exemple `@` devient
`%40`). Adapte aussi l'hôte, le port ou le nom de la base si nécessaire.

## 6. Créer les tables et charger les données

Vérifie que MySQL fonctionne et que `api/.env` est enregistré. Depuis `api` :

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

Le seed charge les hôtels, les chambres et les comptes de démonstration.
**Attention : le seed vide les tables Finder de la base configurée.** Ne
l'exécute que sur une base de développement dédiée dont les données peuvent
être remplacées.

## 7. Tester le projet

Les tests de l'API utilisent la base MySQL configurée dans `api/.env` et les
données de démonstration. Depuis `api` :

```powershell
npm test
npm run check
```

Le frontend peut être vérifié depuis `front` :

```powershell
npm run lint
npm run build
```

## 8. Démarrer l'application

L'API et le frontend doivent rester ouverts dans deux terminaux PowerShell
distincts.

**Terminal 1 — API :**

```powershell
Set-Location "$HOME\source\projet-finder\api"
npm run dev
```

Vérifie [http://localhost:3000/health](http://localhost:3000/health) ; la
réponse attendue est `{"statut":"ok"}`. La documentation interactive est sur
[http://localhost:3000/docs](http://localhost:3000/docs).

**Terminal 2 — frontend :**

```powershell
Set-Location "$HOME\source\projet-finder\front"
npm run dev
```

Ouvre l'adresse affichée par Vite, normalement
[http://localhost:5173](http://localhost:5173). Pour arrêter un serveur,
retourne à son terminal et appuie sur **Ctrl+C**.

## 9. Parcours de vérification de la recherche

Avec MySQL, l'API et le seed démarrés :

1. À l'ouverture du frontend, vérifie que le chargement se termine et que les
   **32 chambres** apparaissent.
2. Renseigne `Amor` dans **Hôtel**, clique sur **Rechercher** : la fiche Amor
   apparaît au-dessus des résultats, qui contiennent ses 12 chambres.
3. Sélectionne une chambre : sa fiche affiche numéro, catégorie, capacité,
   prix, description et hôtel. **Fermer** masque la fiche.
4. Filtre par **Personnes = 4** et **Prix max. = 120** : les chambres
   correspondantes sont affichées par l'API.
5. Essaie un nom d'hôtel inconnu ou un filtre sans résultat : un message
   explicite s'affiche sans page blanche.
6. Saisis une seule date ou des dates dans le mauvais ordre : la recherche
   affiche une erreur de formulaire et n'envoie pas de requête.
7. Pour vérifier l'état d'erreur, arrête temporairement l'API et relance une
   recherche : un message explique que l'API ne répond pas. Redémarre-la pour
   rétablir les recherches.

Les filtres disponibles sont l'hôtel (nom ou identifiant), les dates d'arrivée
et de départ, la capacité, le prix maximal par nuit et la catégorie. Les dates
doivent être toutes deux renseignées ou toutes deux vides.

## 10. Essayer une route protégée

Les comptes de démonstration sont décrits dans
`api/finder-data/comptes.json`. Pour essayer une route protégée :

1. Dans Swagger (`/docs`), ouvre `POST /auth/login` et clique sur **Try it out**.
2. Saisis les identifiants d'un compte de démonstration et clique sur
   **Execute**.
3. Copie le champ `token` de la réponse, puis clique sur **Authorize**.
4. Colle le token sans ajouter `Bearer` (Swagger ajoute lui-même le préfixe).

## Commandes utiles

| Dossier | Commande | Utilité |
| --- | --- | --- |
| `api` | `npm run dev` | Démarrer l'API avec rechargement |
| `api` | `npm start` | Démarrer l'API |
| `api` | `npm test` | Lancer les tests API |
| `api` | `npm run check` | Vérifier la syntaxe JavaScript |
| `api` | `npm run db:seed` | Recharger les données (remplace les données Finder) |
| `front` | `npm run dev` | Démarrer l'interface |
| `front` | `npm run lint` | Vérifier le code frontend |
| `front` | `npm run build` | Construire le frontend dans `front/dist` |
| `front` | `npm run preview` | Prévisualiser le build |

## Résoudre les problèmes courants

### PowerShell bloque `npm` ou `npx`

Si PowerShell bloque les scripts `npm.ps1` ou `npx.ps1`, utilise les
exécutables Windows :

```powershell
npm.cmd ci
npx.cmd prisma generate
```

### L'API ne se connecte pas à MySQL

Vérifie que MySQL est démarré, que la base `finder_local` existe et que
`DATABASE_URL` dans `api/.env` contient le bon utilisateur, mot de passe,
hôte, port et nom de base.

### Prisma indique que les tables sont absentes

Depuis `api`, relance `npx prisma generate` puis `npx prisma migrate deploy`.
Vérifie que ces commandes et le seed utilisent la même base que `api/.env`.

### Le frontend affiche une erreur CORS ou ne trouve pas l'API

Vérifie que l'API fonctionne sur `http://localhost:3000` et que
`FRONTEND_ORIGIN` dans `api/.env` correspond exactement à l'origine affichée
par Vite (protocole, nom d'hôte et port). Après une modification de `.env`,
redémarre l'API.

### Un port est déjà utilisé

Garde les ports par défaut `3000` (API) et `5173` (frontend) si possible. Si
Vite affiche un autre port, mets cette origine dans `FRONTEND_ORIGIN` et
redémarre l'API. Si tu changes le port de l'API, mets également à jour
`front/src/config.js`.

## Structure du projet

- `api/src/` — serveur Express, routes et middlewares ;
- `api/prisma/` — schéma, migrations et seed ;
- `api/finder-data/` — données de démonstration ;
- `api/tests/` — tests API avec Vitest et Supertest ;
- `front/src/` — interface React et composants ;
- `docs/` — spécification, architecture, recette et décisions.

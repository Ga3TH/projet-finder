# Finder

API de réservation de chambres d'hôtel pour les hôtels Amor, Byzance et
Caraïbes. Le serveur Express et la base de données Prisma se trouvent dans
`api`. Swagger permet de consulter et d'essayer les routes de l'API.

> **Ce guide est prévu pour Windows et PowerShell.** Les exemples MySQL
> supposent une installation locale Laragon avec l'utilisateur `root` sans mot
> de passe. Adapte-les si ta configuration est différente.

## Sommaire

1. [Installer les outils](#1-installer-les-outils)
2. [Télécharger le projet](#2-télécharger-le-projet)
3. [Installer les dépendances](#3-installer-les-dépendances)
4. [Créer la base MySQL](#4-créer-la-base-mysql)
5. [Configurer la connexion](#5-configurer-la-connexion)
6. [Créer les tables et charger les données](#6-créer-les-tables-et-charger-les-données)
7. [Lancer les tests](#7-lancer-les-tests)
8. [Démarrer l'API](#8-démarrer-lapi)
9. [Essayer une route protégée](#9-essayer-une-route-protégée)
10. [Résoudre les problèmes courants](#résoudre-les-problèmes-courants)

## 1. Installer les outils

Installe les logiciels suivants :

- [Node.js LTS](https://nodejs.org/)
- [Git for Windows](https://git-scm.com/download/win)
- [Laragon](https://laragon.org/download/) pour MySQL et HeidiSQL
- [Visual Studio Code](https://code.visualstudio.com/) (facultatif)

Si MySQL et un outil pour l'administrer sont déjà installés, Laragon n'est pas
nécessaire. Après l'installation de Node.js et Git, ferme puis rouvre
PowerShell. Vérifie que les commandes sont disponibles :

```powershell
node --version
npm --version
git --version
```

Chaque commande doit afficher un numéro de version.

## 2. Télécharger le projet

Dans PowerShell, télécharge le dépôt et place-toi dans le dossier de l'API :

```powershell
New-Item -ItemType Directory -Force "$HOME\source"
Set-Location "$HOME\source"
git clone https://github.com/Ga3TH/projet-finder.git
Set-Location "$HOME\source\projet-finder\api"
```

Les commandes `npm` et Prisma de ce guide doivent être exécutées depuis le
dossier `api`. Pour confirmer le dossier courant :

```powershell
Get-Location
```

Le chemin doit se terminer par `projet-finder\api`.

## 3. Installer les dépendances

Depuis `api`, installe les dépendances exactes du projet :

```powershell
npm ci
```

## 4. Créer la base MySQL

1. Ouvre Laragon et démarre MySQL (bouton **Start All** ou service MySQL).
2. Ouvre HeidiSQL depuis Laragon et connecte-toi au serveur local.
3. Dans un nouvel onglet de requête, exécute :

```sql
CREATE DATABASE finder_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Si `finder_local` existe déjà, garde cette base et passe à l'étape suivante.

## 5. Configurer la connexion

Dans PowerShell, toujours depuis `api`, crée le fichier local `.env` à partir
du modèle et ouvre-le :

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Pour une installation Laragon avec `root` sans mot de passe, configure ces
valeurs dans `api/.env` :

```dotenv
PORT=3300
DATABASE_URL="mysql://root@127.0.0.1:3306/finder_local"
JWT_SECRET="cle-secrete-locale-a-remplacer"
```

Adapte l'utilisateur, le mot de passe, le port ou le nom de la base si MySQL
est configuré autrement. Par exemple, avec un mot de passe :

```dotenv
DATABASE_URL="mysql://root:mot-de-passe@127.0.0.1:3306/finder_local"
```

Certains caractères dans un mot de passe doivent être encodés dans l'URL
(par exemple `@` devient `%40`). Enregistre `.env` et ne le partage pas :
il contient des paramètres locaux et un secret.

## 6. Créer les tables et charger les données

Vérifie que MySQL est démarré et que `.env` est enregistré. Depuis le dossier
`api`, exécute ces commandes dans l'ordre :

```powershell
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

Prisma prépare le client puis crée les tables ; le seed charge les hôtels,
chambres, comptes et réservations de démonstration.

> **Attention :** le seed vide les tables Finder de la base indiquée par
> `DATABASE_URL` avant d'y charger les données de démonstration. Utilise une
> base locale réservée à Finder, sans données à conserver.

## 7. Lancer les tests

Les tests utilisent MySQL et les données de démonstration chargées à l'étape
précédente. Depuis `api`, lance :

```powershell
npm test
```

Résultat attendu avec la version actuelle : **51 tests réussis**. Pour afficher
aussi le rapport de couverture :

```powershell
npm run test:coverage
```

## 8. Démarrer l'API

Depuis `api`, démarre le serveur :

```powershell
npm run dev
```

Garde ce terminal ouvert. Le serveur affiche une adresse semblable à :

```text
API sur http://localhost:3300
```

Ouvre ensuite :

- [http://localhost:3300/health](http://localhost:3300/health) — vérification
  rapide, réponse attendue : `{"statut":"ok"}`
- [http://localhost:3300/docs](http://localhost:3300/docs) — documentation
  interactive Swagger
- [http://localhost:3300/docs/openapi.json](http://localhost:3300/docs/openapi.json)
  — spécification OpenAPI

Pour arrêter le serveur, reviens au terminal et appuie sur **Ctrl+C**.

## 9. Essayer une route protégée

Les comptes de démonstration et leurs mots de passe sont dans
[`api/finder-data/comptes.json`](api/finder-data/comptes.json).

Dans Swagger :

1. Ouvre `POST /auth/login`, puis clique sur **Try it out**.
2. Saisis l'adresse e-mail et le mot de passe d'un compte de démonstration.
3. Clique sur **Execute** et copie le champ `token` de la réponse.
4. Clique sur **Authorize** en haut de la page et colle le token.
5. Essaie une route protégée.

Ne préfixe pas le token avec `Bearer` dans la fenêtre **Authorize** : Swagger
ajoute lui-même ce préfixe.

## Commandes utiles

Toutes les commandes ci-dessous s'exécutent depuis le dossier `api` :

| Commande | Utilité |
| --- | --- |
| `npm ci` | Installer les dépendances |
| `npm run dev` | Démarrer l'API en développement |
| `npm run check` | Vérifier la syntaxe JavaScript |
| `npm test` | Lancer les tests |
| `npm run test:coverage` | Lancer les tests avec le rapport de couverture |

## Résoudre les problèmes courants

### PowerShell ne reconnaît pas `node`, `npm` ou `git`

Ferme puis rouvre PowerShell après l'installation, puis vérifie à nouveau les
commandes avec `node --version`, `npm --version` et `git --version`.

### PowerShell bloque `npm.ps1` ou `npx.ps1`

Utilise les exécutables Windows `.cmd` :

```powershell
npm.cmd ci
npx.cmd prisma generate
```

### La connexion à MySQL échoue

Vérifie que MySQL est démarré et que `DATABASE_URL` dans `api/.env` contient
le bon utilisateur, mot de passe, adresse, port et nom de base.

### Prisma ne trouve pas les tables

Depuis le dossier `api`, relance :

```powershell
npx prisma generate
npx prisma migrate deploy
```

### Les hôtels ou les chambres ne s'affichent pas

Vérifie que `npm run db:seed` a été exécuté sur la base configurée dans
`api/.env`.

### Swagger ne s'ouvre pas

Vérifie que le terminal du serveur est toujours ouvert. Si tu as modifié `PORT`
dans `.env`, utilise ce port dans l'adresse du navigateur.

### Le port 3300 est déjà utilisé

Modifie `PORT` dans `api/.env`, redémarre l'API et utilise le nouveau port dans
les adresses du navigateur.

## Structure du projet

- `api/src/` — serveur Express, routes et middlewares
- `api/prisma/` — schéma, migrations et données initiales
- `api/finder-data/` — données de démonstration
- `docs/` — spécification et documentation du projet

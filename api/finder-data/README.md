# Kit de données de départ - Finder

Quatre fichiers JSON. Sprint 1, étape 1 : hotels.json et chambres.json se chargent en mémoire (readFileSync ci-dessous) pour servir les fiches publiques. Étape 2 : VOTRE script de seed verse les quatre fichiers dans VOS tables.
Le schéma reste le vôtre : les noms de champs du kit sont une proposition, pas une obligation ;
les identifiants numériques servent seulement à relier les fichiers entre eux.

| Fichier | Contenu | Ce qu'il faut savoir |
|---|---|---|
| hotels.json | les 3 hôtels du groupement (Amor, Byzance, Caraïbes) | un hôtelier = un hôtel ; `gerant` est le nom affiché, le compte est dans comptes.json |
| chambres.json | 32 chambres (12 + 10 + 10), quatre catégories | `numero` est unique DANS un hôtel, pas entre hôtels : (hotel_id, numero) est la clé naturelle |
| comptes.json | 3 hôteliers, 5 voyageurs, 1 admin (bonus) | les mots de passe sont EN CLAIR pour vos tests : le seed les hache (bcrypt) avant insertion, jamais de clair en base |
| reservations.json | 8 réservations, les quatre statuts | la n° 8 chevauche la n° 1 d'une nuit sur la même chambre : elle sert à tester la règle anti-double du Sprint 3 |

Lecture d'un fichier JSON dans un script Node (fragment de syntaxe, à placer dans votre seed) :

```js
import { readFileSync } from 'node:fs'
const hotels = JSON.parse(readFileSync(new URL('./finder-data/hotels.json', import.meta.url), 'utf8'))
```

Règles :
- le kit se copie dans votre dépôt (dossier `finder-data/` à la racine de l'API) et ne se modifie pas : vos données de démo supplémentaires vont dans le seed, pas dans ces fichiers ;
- les adresses `.example` ne sont pas des adresses réelles ; les personnes sont fictives ;
- statuts de réservation : `en_attente`, `confirmee`, `refusee`, `annulee` (sans accent : un mot que le code lit ne porte pas d'accent).

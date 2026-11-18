# API Recettes

Une API Node.js / Express qui récupère les recettes de [TheMealDB](https://www.themealdb.com/api.php), les transforme (champs renommés en français, ingrédients rassemblés en tableau, champs vides enlevés), puis les sert avec filtres, pagination et statistiques calculées.

Toutes les recettes sont chargées une fois (une recherche par lettre de l'alphabet) et gardées en cache en mémoire : la première requête prend quelques secondes, les suivantes sont instantanées.

## Lancer le projet

Prérequis : Node.js 18 ou plus récent (le code utilise le `fetch` natif de Node).

```bash
npm install
npm start
```

Le serveur écoute sur http://localhost:3000. Aucune clé ni inscription : TheMealDB est libre d'accès.

La première requête prend quelques secondes : l'API charge les 26 lettres de l'alphabet sur TheMealDB. Le résultat est gardé en cache en mémoire, donc toutes les requêtes suivantes sont instantanées. Le cache disparaît au redémarrage du serveur. Si TheMealDB est injoignable au premier chargement, les routes renvoient une erreur 500 propre (`{ "erreur": "Erreur du serveur" }`) et il suffit de relancer une requête pour retenter le chargement.

## Routes

| Route | Ce qu'elle renvoie |
| --- | --- |
| `GET /api/recettes` | Liste des recettes nettoyées, paginée (12 par page) : `page`, `nbPages`, `total`, `recettes` |
| `GET /api/recettes/:id` | Une recette par son id. Renvoie 404 si l'id n'existe pas |
| `GET /api/recettes/hasard` | Une recette au hasard |
| `GET /api/categories` | Toutes les catégories avec le nombre de recettes dans chacune, triées de la plus fournie à la moins fournie |
| `GET /api/ingredients` | Les ingrédients les plus utilisés, triés (20 par défaut) |
| `GET /api/stats` | Statistiques calculées : total, nombre de catégories et de pays, moyenne d'ingrédients par recette, répartition par catégorie et par pays |

### Filtres et options de `/api/recettes`

Combinables entre eux :

- `?categorie=Chicken` — une catégorie exacte
- `?pays=Japanese` — un pays exact
- `?recherche=curry` — recherche dans le nom (insensible à la casse)
- `?tri=ingredients` — trie par nombre d'ingrédients décroissant (ordre alphabétique sinon)
- `?page=2` — la page demandée (404 au-delà de la dernière page)

Exemple : `/api/recettes?pays=Japanese&recherche=curry&page=1`

`GET /api/ingredients` accepte `?limite=5` pour réduire la liste.

## Arborescence

```
api-recettes/
├── server.js                        # allume le serveur
├── package.json
├── .gitignore
└── src/
    ├── app.js                       # crée l'app, branche les routes, gère 404 et 500
    ├── routes/
    │   ├── recettes.routes.js       # /api/recettes (liste, hasard, :id)
    │   ├── categories.routes.js     # /api/categories
    │   ├── ingredients.routes.js    # /api/ingredients
    │   └── stats.routes.js          # /api/stats
    └── services/
        └── themealdb.service.js     # seul fichier qui parle à TheMealDB : chargement, nettoyage, cache
```

## Ce que fait la transformation

TheMealDB renvoie chaque recette avec 40 champs à plat (`strIngredient1` à `strIngredient20`, `strMeasure1` à `strMeasure20`). Le service les rassemble :

Exemple réel pour `GET /api/recettes/52772` :

```json
{
  "id": "52772",
  "nom": "Teriyaki Chicken Casserole",
  "categorie": "Chicken",
  "pays": "Japanese",
  "image": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
  "ingredients": [
    { "nom": "soy sauce", "quantite": "3/4 cup" },
    { "nom": "water", "quantite": "1/2 cup" },
    { "nom": "brown sugar", "quantite": "1/4 cup" },
    { "nom": "ground ginger", "quantite": "1/2 teaspoon" },
    { "nom": "minced garlic", "quantite": "1/2 teaspoon" },
    { "nom": "cornstarch", "quantite": "4 Tablespoons" },
    { "nom": "chicken breasts", "quantite": "2" },
    { "nom": "stir-fry vegetables", "quantite": "1 (12 oz.)" },
    { "nom": "brown rice", "quantite": "3 cups" }
  ],
  "nbIngredients": 9
}
```

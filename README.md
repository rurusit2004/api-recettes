# API Recettes

Une API Node.js / Express qui récupère les recettes de [TheMealDB](https://www.themealdb.com/api.php), les transforme (champs renommés en français, ingrédients rassemblés en tableau, champs vides enlevés), puis les sert avec filtres, pagination et statistiques calculées.

Toutes les recettes sont chargées une fois (une recherche par lettre de l'alphabet) et gardées en cache en mémoire : la première requête prend quelques secondes, les suivantes sont instantanées.

## Lancer le projet

```bash
npm install
npm start
```

Le serveur écoute sur http://localhost:3000. Aucune clé ni inscription : TheMealDB est libre d'accès.

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

```json
{
  "id": "52772",
  "nom": "Teriyaki Chicken Casserole",
  "categorie": "Chicken",
  "pays": "Japanese",
  "image": "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
  "ingredients": [
    { "nom": "soy sauce", "quantite": "3/4 cup" },
    { "nom": "water", "quantite": "1/2 cup" }
  ],
  "nbIngredients": 9
}
```

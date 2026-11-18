// Seul fichier qui connait l'API TheMealDB.
// Il charge toutes les recettes une fois (une recherche par lettre),
// les nettoie, puis les garde en cache pour les visites suivantes.

const BASE = 'https://www.themealdb.com/api/json/v1/1'
const LETTRES = 'abcdefghijklmnopqrstuvwxyz'.split('')

function nettoyer (plat) {
  const ingredients = []
  // TheMealDB renvoie 20 champs strIngredientN / strMeasureN a plat :
  // on les rassemble en un vrai tableau, sans les champs vides.
  for (let i = 1; i <= 20; i++) {
    const nom = plat['strIngredient' + i]
    const quantite = plat['strMeasure' + i]
    if (nom && nom.trim() !== '') {
      ingredients.push({
        nom: nom.trim(),
        quantite: quantite ? quantite.trim() : ''
      })
    }
  }
  return {
    id: plat.idMeal,
    nom: plat.strMeal,
    categorie: plat.strCategory,
    pays: plat.strArea,
    image: plat.strMealThumb,
    ingredients: ingredients,
    nbIngredients: ingredients.length
  }
}

let cache = null

export async function chercherRecettes () {
  if (cache) {
    return cache
  }
  const toutes = []
  for (const lettre of LETTRES) {
    const response = await fetch(BASE + '/search.php?f=' + lettre)
    if (!response.ok) {
      throw new Error('TheMealDB ne repond pas (HTTP ' + response.status + ')')
    }
    const donnees = await response.json()
    // meals vaut null quand la lettre ne renvoie rien : on teste avant de boucler
    if (donnees.meals) {
      for (const plat of donnees.meals) {
        toutes.push(nettoyer(plat))
      }
    }
  }
  cache = toutes
  return cache
}

export async function chercherRecetteParId (id) {
  const recettes = await chercherRecettes()
  return recettes.find((recette) => recette.id === id) || null
}

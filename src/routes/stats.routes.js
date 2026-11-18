import { Router } from 'express'
import { chercherRecettes } from '../services/themealdb.service.js'

const router = Router()

// Des chiffres que TheMealDB ne donne pas : on les calcule nous-memes
// sur les recettes nettoyees (categorie et pays, en francais).
router.get('/', async (req, res, next) => {
  try {
    const recettes = await chercherRecettes()
    const parCategorie = {}
    const parPays = {}
    let totalIngredients = 0
    for (const recette of recettes) {
      // 190 recettes n'ont pas de pays dans TheMealDB : on les regroupe
      const pays = recette.pays || 'Inconnu'
      parCategorie[recette.categorie] = (parCategorie[recette.categorie] || 0) + 1
      parPays[pays] = (parPays[pays] || 0) + 1
      totalIngredients = totalIngredients + recette.nbIngredients
    }
    res.json({
      totalRecettes: recettes.length,
      nbCategories: Object.keys(parCategorie).length,
      nbPays: Object.keys(parPays).length - (parPays.Inconnu ? 1 : 0),
      nbMoyenIngredients: Math.round((totalIngredients / recettes.length) * 10) / 10,
      parCategorie: parCategorie,
      parPays: parPays
    })
  } catch (err) {
    next(err)
  }
})

export default router

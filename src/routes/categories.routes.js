import { Router } from 'express'
import { chercherRecettes } from '../services/themealdb.service.js'

const router = Router()

// Toutes les categories, avec le nombre de recettes dans chacune,
// de la plus fournie a la moins fournie.
router.get('/', async (req, res, next) => {
  try {
    const recettes = await chercherRecettes()
    const compteurs = {}
    for (const recette of recettes) {
      compteurs[recette.categorie] = (compteurs[recette.categorie] || 0) + 1
    }
    const categories = Object.entries(compteurs)
      .map(([nom, nbRecettes]) => ({ nom, nbRecettes }))
      .sort((a, b) => b.nbRecettes - a.nbRecettes)
    res.json({
      total: categories.length,
      categories: categories
    })
  } catch (err) {
    next(err)
  }
})

export default router

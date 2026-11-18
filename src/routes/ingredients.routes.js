import { Router } from 'express'
import { chercherRecettes } from '../services/themealdb.service.js'

const router = Router()

// Les ingredients les plus utilises dans les recettes, tries.
// ?limite=5 pour n'en garder que cinq (20 par defaut).
router.get('/', async (req, res, next) => {
  try {
    const recettes = await chercherRecettes()
    const compteurs = {}
    for (const recette of recettes) {
      for (const ingredient of recette.ingredients) {
        const cle = ingredient.nom.toLowerCase()
        compteurs[cle] = (compteurs[cle] || 0) + 1
      }
    }
    const limite = Number(req.query.limite) || 20
    const ingredients = Object.entries(compteurs)
      .map(([nom, nbRecettes]) => ({ nom, nbRecettes }))
      .sort((a, b) => b.nbRecettes - a.nbRecettes)
      .slice(0, limite)
    res.json({
      totalDistincts: Object.keys(compteurs).length,
      ingredients: ingredients
    })
  } catch (err) {
    next(err)
  }
})

export default router

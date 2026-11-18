import { Router } from 'express'
import { chercherRecettes, chercherRecetteParId } from '../services/themealdb.service.js'

const router = Router()
const PAR_PAGE = 12

// Liste des recettes, avec filtres combinables, tri et pagination.
// Exemples :
//   /api/recettes?page=2
//   /api/recettes?categorie=Chicken
//   /api/recettes?pays=Japanese&recherche=curry
//   /api/recettes?tri=ingredients
router.get('/', async (req, res, next) => {
  try {
    let recettes = await chercherRecettes()

    if (req.query.categorie) {
      recettes = recettes.filter(
        (r) => r.categorie.toLowerCase() === req.query.categorie.toLowerCase()
      )
    }
    if (req.query.pays) {
      // Certaines recettes n'ont pas de pays (null dans TheMealDB)
      recettes = recettes.filter(
        (r) => (r.pays || '').toLowerCase() === req.query.pays.toLowerCase()
      )
    }
    if (req.query.recherche) {
      const terme = req.query.recherche.toLowerCase()
      recettes = recettes.filter((r) => r.nom.toLowerCase().includes(terme))
    }

    // Tri : par nombre d'ingredients decroissant, ou alphabetique par defaut
    if (req.query.tri === 'ingredients') {
      recettes = [...recettes].sort((a, b) => b.nbIngredients - a.nbIngredients)
    } else {
      recettes = [...recettes].sort((a, b) => a.nom.localeCompare(b.nom))
    }

    // On filtre d'abord, on pagine ensuite. Dans l'autre sens, le total est faux.
    const total = recettes.length
    const nbPages = Math.ceil(total / PAR_PAGE)
    const page = Number(req.query.page) || 1
    if (page < 1 || (nbPages > 0 && page > nbPages)) {
      return res.status(404).json({ erreur: 'Cette page n existe pas' })
    }
    const debut = (page - 1) * PAR_PAGE
    res.json({
      page: page,
      nbPages: nbPages,
      total: total,
      recettes: recettes.slice(debut, debut + PAR_PAGE)
    })
  } catch (err) {
    next(err)
  }
})

// Une recette au hasard, tiree du cache.
// Declaree avant /:id, sinon "hasard" serait pris pour un id.
router.get('/hasard', async (req, res, next) => {
  try {
    const recettes = await chercherRecettes()
    const auHasard = recettes[Math.floor(Math.random() * recettes.length)]
    res.json(auHasard)
  } catch (err) {
    next(err)
  }
})

// Une recette par son id, avec un vrai 404 si elle n'existe pas.
router.get('/:id', async (req, res, next) => {
  try {
    const recette = await chercherRecetteParId(req.params.id)
    if (!recette) {
      return res.status(404).json({ erreur: 'Aucune recette avec l id ' + req.params.id })
    }
    res.json(recette)
  } catch (err) {
    next(err)
  }
})

export default router

import express from 'express'
import cors from 'cors'
import recettesRoutes from './routes/recettes.routes.js'
import categoriesRoutes from './routes/categories.routes.js'
import ingredientsRoutes from './routes/ingredients.routes.js'
import statsRoutes from './routes/stats.routes.js'

const app = express()

app.use(cors())

app.use('/api/recettes', recettesRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/ingredients', ingredientsRoutes)
app.use('/api/stats', statsRoutes)

// Aucune route ne correspond
app.use((req, res) => {
  res.status(404).json({ erreur: 'Route inconnue : ' + req.originalUrl })
})

// Quelque chose a casse
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ erreur: 'Erreur du serveur' })
})

export default app

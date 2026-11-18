import app from './src/app.js'

const PORT = 3000

app.listen(PORT, () => {
  console.log('API recettes prete sur http://localhost:' + PORT)
})

const express = require('express')

const app = express()

const PORT = process.env.PORT || 5000

app.use(express.json())

app.get('/', (req, res) => {
    try {
        res.send('Funcionou!')
    } catch(err) {
        res.status(400).send(err)
    }
})

require('./controllers/Auth')(app)

app.listen(PORT, () => {
    console.log('Server running on PORT: ' + PORT)
})
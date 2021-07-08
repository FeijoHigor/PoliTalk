const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/politalk', {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

module.exports = mongoose
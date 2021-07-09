const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost/politalk', {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

module.exports = mongoose
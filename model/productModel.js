

const mongoose = require("mongoose")

const Schema = mongoose.Schema


const productSchema = new Schema({
    name: {
        type: String,
        unique: true
    },
    price: {
        type: String
    },
    description: {
        type: String
    },
    image: {
        type: String
    }
})


const Product = mongoose.model("Product", productSchema)


module.exports = Product




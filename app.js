require('dotenv').config()
const express = require("express");
const connectDatabase = require('./database');
const Product = require('./model/productModel');


const app = express();
app.use(express.json())

const { multer, storage } = require('./middleware/multerConfig')


const upload = multer({ storage: storage })

connectDatabase()



app.get("/product", async (req, res) => {
    const products = await Product.find()
    res.json({
        message: "Product fetched successfully",
        data: products
    })
})

app.get("/product/:id", async (req, res) => {
    const { id } = req.params;
    productwithid = await Product.findById(id);

    if (!productwithid) {
        return res.json({
            message: "Product not found!"
        })
    } 

    res.status(200).json({
        message: "Product fetched successfully!",
        data: productwithid
    })


})

app.delete("/product/:id", async (req, res) => {
    const { id } = req.params;
    deleteproduct = await Product.findByIdAndDelete(id);

    res.status(200).json({
        message: "Product delelted successfully!",
        data: deleteproduct
    })
})

app.patch("/product/:id", async (req, res) => {

    const { id } = req.params

    const { name, description, price, image } = req.body;

    await Product.findByIdAndUpdate(id, {
        name,
        description,
        price,
        image,
    });

    res.status(200).json({
        message: "Producte updated successfully!"
    })

})


app.post("/product", upload.single('image'), async (req, res) => {
    console.log(req.body)
    console.log(req.file)

    const { name, price, description, image } = req.body

    const filename = req.file.filename

    await Product.create({
        name, price, description, image: filename
    })

    res.status(200).json({
        message: "Product added successfully.",
        data: req.body
    })

})


app.listen(process.env.PORT, () => {
    console.log("Server started")
})






require('dotenv').config()
const express = require("express");
const connectDatabase = require('./database');
const Product = require('./model/productModel');


const app = express();
app.use(express.json())

const {multer, storage} = require('./middleware/multerConfig')


const upload = multer({storage: storage})

 
connectDatabase()

app.get( "/product", async ( req, res ) =>  {
    const products = await Product.find()
    res.json({
        message:"Product fetched successfully",
        data: products
    })
})

app.post("/product", upload.single('image') , async (req,res) =>{
    console.log(req.body)
    console.log(req.file)

    const { name, price, description, image  } = req.body

    const filename = req.file.filename

    await Product.create({
        name, price, description, image : filename
    })

    res.status(200).json({
        message: "Product added successfully.",
        data: req.body
    })

})
 

app.listen(process.env.PORT, ()=> {
    console.log("Server started")
})






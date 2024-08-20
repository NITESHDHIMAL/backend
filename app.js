require('dotenv').config()
const express = require("express");
const connectDatabase = require('./database');
const Product = require('./model/productModel');


const app = express();
app.use(express.json())

const {multer, storage} = require('./middleware/multerConfig')


const upload = multer({storage: storage})

 
connectDatabase()

app.get( "/", ( req, res ) =>  {
    res.json({
        message:"this is home page"
    })
})

app.post("/product", upload.single('image') , async (req,res) =>{
    console.log(req.body)

    const { name, price, description, image  } = req.body

    await Product.create({
        name, price, description, image
    })

    res.status(200).json({
        message: "Product added successfully.",
        data: req.body
    })

})




app.listen(process.env.PORT, ()=> {
    console.log("Server started")
})






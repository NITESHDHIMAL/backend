require('dotenv').config()
const express = require("express");
const connectDatabase = require('./database');
const Product = require('./model/productModel');


const app = express();
app.use(express.json())

const { multer, storage } = require('./middleware/multerConfig');
const User = require('./model/userModel');


const upload = multer({ storage: storage })

connectDatabase()



app.get("/product", async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    const skip = (page - 1) * limit;

    const products = await Product.find().skip(skip).limit(limit);

    const total = await Product.countDocuments();


    res.json({
        message: "Product fetched successfully",
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        data: products
    })
})


app.get("/product/search", async (req, res) => {

    const { q } = req.query

    if (!q) {
        return res.json({
            message: "Product not found."
        });
    }

    try {
        const products = await Product.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { description: { $regex: q, $options: "i" } },
            ],
        })

        res.status(200).json({
            message: "Search results fetched successfully",
            data: products

        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while searching for products."
        })
    }


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


// Register a new user 
app.post("/register", async (req, res) => {

    const { name, email, password } = req.body;


    try {
        // check if the user already exists 
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "User already exists"
            })
        };

        // create a new user 
        user = new User({
            name,
            email,
            password
        })

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            data: user,
        })

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }

 


});




app.listen(process.env.PORT, () => {
    console.log("Server started")
})






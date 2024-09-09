require('dotenv').config()
const express = require("express");
const connectDatabase = require('./database');
const Product = require('./model/productModel');
const Cart = require('./model/cartModel')
const cors = require("cors")

const app = express();
app.use(express.json())
const { multer, storage } = require('./middleware/multerConfig');
const User = require('./model/userModel');
const jwt = require("jsonwebtoken");

// for file uploading 
const upload = multer({ storage: storage })

connectDatabase()

const protectroute = require("./authMiddleware");


const corsOptions = {
  origin: ['http://localhost:5173', 'https://backend-xm6p.onrender.com'], // Allow both frontend and backend origins
  methods: 'GET,POST,PUT,DELETE', // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true, // Allow cookies/auth headers to be sent
};

// Use CORS middleware
app.use(cors(corsOptions));



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


app.get("/product/search", protectroute, async (req, res) => {

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

app.get("/product/:id", protectroute, async (req, res) => {
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

app.delete("/product/:id", protectroute, async (req, res) => {
  const { id } = req.params;
  deleteproduct = await Product.findByIdAndDelete(id);

  res.status(200).json({
    message: "Product delelted successfully!",
    data: deleteproduct
  })
})

app.patch("/product/:id", protectroute, async (req, res) => {

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


app.post("/product", protectroute, upload.single('image'), async (req, res) => {
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
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    user = new User({
      name,
      email,
      password,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login a user and generate a JWT
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if the password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// Create - Add item to the cart
app.post('/cart', protectroute, async (req, res) => {
  const { productId, name, quantity, price } = req.body;

  try {
    const cartItem = new Cart({ productId, name, quantity, price });
    await cartItem.save();
    res.status(201).json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read - Get all cart items
app.get('/cart', protectroute, async (req, res) => {
  try {
    const cartItems = await Cart.find();
    res.json({
      data: cartItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read - Get a single cart item by id
app.get('/cart/:id', protectroute, async (req, res) => {
  try {
    const cartItem = await Cart.findById(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update - Update cart item quantity
app.put('/cart/:id', protectroute, async (req, res) => {
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json(cartItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete - Remove cart item
app.delete('/cart/:id', protectroute, async (req, res) => {
  try {
    const cartItem = await Cart.findByIdAndDelete(req.params.id);
    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete - Remove all cart items
app.delete('/cart', protectroute, async (req, res) => {
  try {
    await Cart.deleteMany({});
    res.json({ message: 'All cart items removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(process.env.PORT, () => {
  console.log("Server started")
})

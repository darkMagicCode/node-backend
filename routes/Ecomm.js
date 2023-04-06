const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { User, Product, Order } = require("../models/Ecomm");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
// configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("image");
// check file type function
function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
function getImageUrl(req, imagePath) {
  const normalizedPath = imagePath.replace(/\\/g, "/");
  return `${process.env.ROOT_URL || "http://localhost:4000"}/${normalizedPath}`;
}
// --------------------------------------// --------------------------------------

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      { name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Generate refresh token and save it to database
    const refreshToken = jwt.sign(
      { name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login successful",
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal asdserver errora" });
  }
});

router.post("/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/users", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Updates a user with the specified userId.
router.patch("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.password = req.body.password || user.password;

    await user.save();

    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});
// Deletes a user with the specified userId.
router.delete("/users/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    await user.deleteOne();

    res.send("User deleted successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});
// define route for creating a new product with an image
router.post("/products", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).send(err);
      return;
    }

    try {
      const imageUrl = getImageUrl(req, req.file.path);
      const product = new Product({
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        quantity: req.body.quantity,
        status: req.body.status,
        image: imageUrl,
      });

      await product.save();

      res.send(product);
    } catch (error) {
      res.status(400).send(error);
    }
  });
});
router.patch("/products/:id", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).send(err);
      return;
    }

    try {
      const imageUrl = getImageUrl(req, req.file.path);
      const product = await Product.findById(req.params.id);

      // Check if product has an image
      if (product.image) {
        // Extract filename from image URL
        const imagePath = product.image.replace(
          `${req.protocol}://${req.hostname}:${process.env.PORT || 4000}/`,
          ""
        );
        const imageFilename = path.join(__dirname, "..", imagePath);

        // Delete file from uploads folder
        fs.unlink(imageFilename, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }

      // Update product with new data
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          price: req.body.price,
          description: req.body.description,
          quantity: req.body.quantity,
          status: req.body.status,
          image: imageUrl,
        },
        { new: true }
      );

      res.send(updatedProduct);
    } catch (error) {
      res.status(400).send(error);
    }
  });
});
// Returns a list of all products.
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.send(products);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send(product);
  } catch (error) {
    res.status(500).send(error);
  }
});
// Deletes the product with the specified productId.
router.delete("/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.send("Product deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});
// Create new order for user
router.post("/users/:userId/orders", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if there is an existing order for the user
    let order = await Order.findOne({ userId: user._id });

    // If no order exists, create a new one
    if (!order) {
      order = new Order({
        userId: user._id,
        products: [],
      });
    }

    // Loop through the products in the request body
    for (const product of req.body.products) {
      const existingProduct = order.products.find(
        (p) => p.productId.toString() === product.productId
      );

      if (existingProduct) {
        // If the product already exists in the cart, update the quantity
        existingProduct.quantity += product.quantity;
      } else {
        // Otherwise, add the product to the cart
        order.products.push({
          productId: product.productId,
          quantity: product.quantity,
        });
      }
    }

    await order.save();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});
// Updates the order for the user with the specified userId
router.patch("/users/:userId/orders", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Check if there is an existing order for the user
    let order = await Order.findOne({ userId: user._id });

    // If no order exists, create a new one
    if (!order) {
      order = new Order({
        userId: user._id,
        products: [],
      });
    }

    // Loop through the products in the request body
    for (const product of req.body.products) {
      const existingProduct = order.products.find(
        (p) => p.productId.toString() === product.productId
      );

      if (existingProduct) {
        // If the product already exists in the cart, update the quantity
        existingProduct.quantity = product.quantity;
      } else {
        // Otherwise, add the product to the cart
        order.products.push({
          productId: product.productId,
          quantity: product.quantity,
        });
      }
    }

    await order.save();
    res.send(order);
  } catch (error) {
    res.status(400).send(error);
  }
});
// gett all orders to the userId
router.get("/users/:userId/orders", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const orders = await Order.find({ userId: user._id }).populate(
      "products.productId"
    );
    res.send({
      user,
      orders: orders.map((order) => ({
        _id: order._id,
        userId: order.userId,
        products: order.products.map((product) => ({
          quantity: product.quantity,
          product: product.productId,
        })),
      })),
    });
  } catch (error) {
    res.status(400).send(error);
  }
});
// --------------------------------------// --------------------------------------
// get all orders in DB
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({});
    res.send(orders);
  } catch (error) {
    res.status(500).send(error);
  }
});
// del all orders in DB
router.delete("/orders", async (req, res) => {
  try {
    const result = await Order.deleteMany({});
    res.send(`Deleted ${result.deletedCount} orders successfully`);
  } catch (error) {
    res.status(500).send(error);
  }
});
// --------------------------------------// --------------------------------------
router.get("/users/:userId/orders/:orderId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const order = await Order.findById(req.params.orderId).populate(
      "products.productId"
    );
    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (!order.userId.equals(user._id)) {
      return res.status(404).send("Order not found for this user");
    }

    res.send({
      user,
      order: {
        _id: order._id,
        userId: order.userId,
        products: order.products.map((product) => ({
          quantity: product.quantity,
          product: product.productId,
        })),
      },
    });
  } catch (error) {
    res.status(400).send(error);
  }
});
router.patch("/users/:userId/orders/:orderId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: req.body },
      { new: true }
    ).populate("products.productId");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    if (!order.userId.equals(user._id)) {
      return res.status(404).send("Order not found for this user");
    }

    res.send({
      user,
      order: {
        _id: order._id,
        userId: order.userId,
        products: order.products.map((product) => ({
          quantity: product.quantity,
          product: product.productId,
        })),
      },
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// router.get('/search', async (req, res) => {
//   const searchQuery = req.query.title;
//   const regex = new RegExp(searchQuery, 'i');
//   const products = await Product.find({ title: regex });
//   res.json(products);
// });

module.exports = router;
// import React from 'react';
// import { connect } from 'react-redux';
// import { Redirect } from 'react-router-dom';

// const ProtectedRoute = ({ component: Component, isAuthenticated, ...rest }) => (
//   <Route {...rest} render={(props) => (
//     isAuthenticated ? <Component {...props} /> : <Redirect to="/login" />
//   )} />
// );

// const mapStateToProps = (state) => ({
//   isAuthenticated: state.auth.isAuthenticated,
// });

// export default connect(mapStateToProps)(ProtectedRoute);

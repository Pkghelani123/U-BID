const express = require("express");
const path = require('path');
const fs = require("fs");
const hbs = require("hbs");
const app = express();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const multer = require('multer');
const expressLayouts = require('express-ejs-layouts');
// const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const bodyparser = require('body-parser');

const fileUpload = require('express-fileupload');
// const pdfkit = require('pdfkit');
const { timeStamp } = require("console");
var cors = require('cors');
app.use(cors('*'));
var nm = require('nodemailer');
mongoose.set('strictQuery', true);
const port = 8000;
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }
  const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// get the mongoose connection conn.js file
require("./db/conn");
const User = require('./models/user');
const Item = require('./models/item');


// const staticPath = path.join(__dirname, "../img/Aadit.jpg");
// app.use(express.static(staticPath));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// set the view engine as a handlebars(hbs)
const engine = app.set("view engine", "hbs");

// Get the path of views directory
const templatePath = path.join(__dirname, "../templates/views/");
app.set("views", templatePath);

// Get the path of partials directory
const partialPath = path.join(__dirname, "../templates/partials/");

// Getting the partials as hbs
hbs.registerPartials(partialPath);


app.use(express.json());
app.use(express.static(__dirname))
// For get the data in mongodb compass
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static( 'uploads'));

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

  // app.post('/upload', upload.single('photo'), async (req, res) => {
  //   const item = new Item({
  //     name: req.body.name,
  //     price: req.body.price,
  //     category: req.body.category,
  //     description: req.body.description,
  //     photo: req.file.path
  //   });
  
  //   try {
  //     await item.save();
  //     res.redirect('/home');
      
  //   } catch (err) {
  //     console.log('Error saving item:', err);
  //     res.status(500).send('Error saving item to database');
  //   }
  // });
  const updateItemStatus = async (itemId) => {
    try {
      const item = await Item.findById(itemId);
      item.status = 'expired';
      await item.save();
      console.log(`Item ${item._id} status has been updated to expired`);
      // res.redirect('/bid')
    } catch (err) {
      console.log(`Error updating item ${itemId} status: ${err}`);
    }
  };

  app.post('/upload', upload.single('photo'), async (req, res) => {
    const item = new Item({
      name: req.body.name,
      price: req.body.price,
      email: req.body.email,
      category: req.body.category,
      description: req.body.description,
      photo: req.file.path,
      status: 'active'
    });
  
    try {
      await item.save();
      console.log(`Item ${item._id} has been created`);
  
      // Schedule the updateItemStatus function to run after 24 hours
      setTimeout(() => {
        updateItemStatus(item._id);
      }, 2 * 60 * 1000);
      
  
      res.redirect('/home');
    } catch (err) {
      console.log('Error saving item:', err);
      res.status(500).send('Error saving item to database');
    }
  });
  
  // app.get('/bid',async(req, res) => {

  //   try{
  //     const items = await Item.find();
  //     res.render('bid',{ items });
  //   }catch{
  //     console.log(err);
  //   }
  
  // });



  app.post('/send', async (req, res) => {
    const email = req.body.email;
    const price = req.body.price;
  

  

    
    // send email using Nodemailer
    const transporter = nodemailer.createTransport({
      host:"smtp.gmail.com",
      port: 465,
      secure: true,
      service: 'gmail',
      auth: {
        user: 'pkghelani4959@gmail.com',
        pass: 'sedhtifpksooveua'
      }
    });
  
    const mailOptions = {
      from: 'pkghelani4959@gmail.com',
      to: email,
      subject: 'Auction result',
      text: `Your item has been successfully sold for a bid price of ${price}.`
    };
    
  
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email} `);
      res.redirect('/home');
    } catch (err) {
      console.log(`Error sending email to ${email}: ${err}`);
      res.status(500).send('Error sending email');
    }
  });





  app.get('/bid', async (req, res) => {
    try {
      const items = await Item.find({ status: 'active' });
      res.render('bid', { items });
    } catch (err) {
      console.log(err);
      res.status(500).send('Error retrieving items from database');
    }
  });
  app.get('/admin', async (req, res) => {
    try {
      const items = await Item.find({ status: 'expired' });
      res.render('admin', { items });
    } catch (err) {
      console.log(err);
      res.status(500).send('Error retrieving items from database');
    }
  });

  app.post('/update/:id', async function(req, res) {
    try {
      const item = await Item.findByIdAndUpdate(req.params.id, { price: req.body.bid }, { new: true });
      // new: true returns the updated item after update operation
      // res.send(`Bid of ${req.body.bid} has been successfully placed on ${item.name}`);
      res.redirect('/bid'); // <-- Add this line
    } catch (err) {
      console.log(err);
      res.send('Error occurred while updating the item price');
    }
  });
  

app.get('/',(req, res) => {

    res.render('login.hbs');
});


app.get('/sell',(req, res) => {

    res.render('sell.hbs');
});
// app.get('/admin',(req, res) => {

//   res.render('admin.hbs');
// });
app.get('/home', async (req, res) => {
  
    res.render('home.hbs');
});
app.get('/register', (req, res) => {
    res.render('register');
  });

  app.get('/about', (req, res) => {
    res.render('about');
  });
  
  

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user || user.password !== password) {
      res.render('login', { error: 'Invalid email or password' });
      return;
    }
  
    res.redirect('/home');
  });
  
  
  app.post('/register', async (req, res) => {
    const { name, email, password, phone } = req.body;
  
    const user = new User({
      name,
      email,
      password,
      phone
    });
  
    try {
      await user.save();
      res.redirect('/');
      
    } catch (error) {
      res.render('register', { error: 'Error registering user' });
    }

    
  });
  
  
  
  
  
    // Do something with the uploaded photo, name, and description
  
  app.get('/dashboard', (req, res) => {
    res.render('dashboard');
  });

// Start the server
app.listen(port, () => {
    console.log(`The application started successfully on port ${port}`);
});
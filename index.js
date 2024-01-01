//adding variables for express, mongoose, bodyparser, path and mySQLDAO
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const mySQLDAO = require('./mySQLDAO');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Define the Manager schema and model outside of the route
const managerSchema = new mongoose.Schema({
  _id: String,
  name: String,
  salary: Number,
});

const Manager = mongoose.model('Manager', managerSchema);

// Connect to MongoDB server
mongoose.connect('mongodb+srv://admin:admin@cluster0.6c85h3g.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//error handling for mongodb 
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error with MongoDB:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//setting path to vies for ejs files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MySQL routes


//home page
app.get('/', (req, res) => {
  res.render('homepage');
});

// '/store' page
app.get('/store', (req, res) => {
  mySQLDAO.getStore()
    .then((data) => {
      res.render("store", { "store": data });
    })
    .catch((error) => res.send(error));
});

//gets from storeProduct ejs file
app.get('/storeProduct', (req, res) => {
  mySQLDAO.getProduct_Store()
    .then((data) => {
      res.render("storeProduct", { "product_store": data });
    })
    .catch((error) => res.send(error));
});

// MongoDB route
app.get('/managersMongoDB', async (req, res) => {
  try {
    const data = await Manager.find({}, { _id: 0 }).lean().exec();
    res.render('mongoDBManagers', { data });
    console.log(data);
  } catch (error) {
    console.error('Error retrieving data from MongoDB:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});


// Update Store
app.get('/editStore', async (req, res) => {
  const storeId = req.query.storeId;

  //try catch for error handling
  try {
    const storeData = await mySQLDAO.getStoreViaID(storeId);
    res.render('storeEdit', { storeData });
    console.log(storeData);
  } catch (error) {
    console.error('Error with retrieving store data:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

app.post('/editStore/:storeId', async (req, res) => {
  const storeId = req.params.storeId;
  const newData = req.body.newData;
//asynchronous method
  try {
    await mySQLDAO.updateStore(storeId, newData);
    res.status(200).send('Store updated!');
  } catch (error) {
    console.error('Error updating:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

// Add Store
app.get('/addStore', (req, res) => {
  res.render('storeAdd', { errorMessage: null });
});
//adds store to the database
app.post('/addStore', async (req, res) => {
  const sid = req.body.sid;
  const location = req.body.location;
  const mgrid = req.body.mgrid;

  try {
    const managerExists = await mySQLDAO.isManagerIn(mgrid);

    if (managerExists) {
      return res.render('storeAdd', { errorMessage: `Manager ${mgrid} is already managing another store.` });
    }

    await mySQLDAO.addStore(sid, location, mgrid);
    res.redirect('/store');
  } catch (error) {
    console.error('Error with adding store to database:', error);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});
//shows product page
app.get('/product', (req, res) => {
  mySQLDAO.getProduct()
    .then((data) => {
      res.render("product", { "product": data });
    })
    .catch((error) => res.send(error));
});

//listening on port 3000
app.listen(3000, () => {
  console.log('Listening on port 3000');
});

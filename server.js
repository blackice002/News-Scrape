// dependencies
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const eHandle = require('express-handlebars');

let PORT = process.env.PORT || 8080;

// initialize express
const app = express();

// use morgan logger for logging requests
app.use(logger('dev'));


// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// set static directory

app.use(express.static('public'));

// Set Handlebars as the default templating engine
app.engine('handlebars', eHandle({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// database configuration
let MONGODB_URI = process.env.MONGODB_URI || "mongodb://blackice:blackice002@ds231387.mlab.com:31387/heroku_b8c4s8r6";

mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
mongoose.Promise = Promise;
// check connection status


require('./routes/routes.js')(app);

// start server
app.listen(PORT, ()=>{
    console.log(`App running on port ${PORT}`);
});
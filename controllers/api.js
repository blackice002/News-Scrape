const express = require("express");
// const router = express.Router();
const db = require("../models");
// const request = require("request"); //Makes http calls
const cheerio = require("cheerio");
const axios = require("axios");
const app = express();

const weburl = "https://www.androidpolice.com";
// Routes

// fx: GET route for scraping the target website (gsmarena.com)
app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with axios
    axios.get(weburl).then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Acquiring elements from this targeted class:
        $(".post").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .find('h2')
                .text().trim();
            result.link = $(this)
                .find('a')
                .attr("href");
            result.summary = $(this)
                .find('p')
                .text().trim();
            result.image = $(this)
                .find('.img-hero')
                // .children('img')
                .attr("src");
console.log(result);
            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function(dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });

        // Send a message to the client
        // alert("Scrape Complete");
        res.redirect('/');
    });
});

app.get("/", (req, res) => {

    db.Article.find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            // const retrievedArticles = dbArticle;
            // let articleObj;
            // articleObj = {
            //     articles: dbArticle
            // };
            res.render("index", { things: dbArticle });
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});



// Route for getting all Articles from the db
app.get("/articles", (req, res)=> {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({})
        .then(function(dbLibrary) {
            res.json(dbLibrary);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res)=> {
    var getid = req.params.id
    console.log("GET FUNCTION ID IS: " + getid)

    db.Article.findOne({ _id: getid })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/notes", (req, res) => {
    db.Note.find({})
        .then(function(dbLibrary) {
            res.json(dbLibrary);
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", (req, res)=> {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    let localID = req.params.id;
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: localID }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.get("/dropdb", (req,res)=> {
    db.Article.remove({})
      .then(function() {
          return db.Note.remove({});
      })
      .then(function() {
        res.redirect('/');
      })
})

module.exports = app;
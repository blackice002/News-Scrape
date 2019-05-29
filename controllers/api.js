const express = require("express");
// const router = express.Router();
const db = require("../models");
// const request = require("request"); //Makes http calls
const cheerio = require("cheerio");
const axios = require("axios");
const app = express();
const weburl = "https://www.androidpolice.com";
// Routes

// scraping news from const webUrl
app.get("/scrape", (req, res) => {
    // First, we grab the body of the html with axios
    axios.get(weburl).then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Acquiring elements from this targeted class:
        $(".post").each(function (i, element) {
            // Save an empty result object
            var result = {};
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
                .attr("src");
            console.log(result);
// Create a new  database of Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
        res.redirect("/")
    });

});

// routes for the home page to get aal unsaved file
app.get("/", (req, res) => {
    db.Article.find({saved:false})
        .then((dbArticle) =>
            res.render("index", { allArticle: dbArticle }))
        .catch((err) => res.json(err));
});


//routes for the saved article
app.get("/saved", (req, res) => {
    db.Article.find({ saved: true })
        .then((dbArticle) => {
            res.render("saved", { allArticle: dbArticle });
        });
});

// update the article from all arlticle to save
app.put("/saved/:id", (req, res)=> {
    db.Article.findOneAndUpdate(
        req.params.id, {
          $set: req.body
        }, {
          new: true
        })
      .then((dbArticle)=> 
        res.json(dbArticle))
      .catch(function(err) {
        res.json(err);
      });
  });

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", (req, res) => {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then((dbArticle) => res.json(dbArticle))
        .catch((err) => res.json(err)
        );
});

app.get("/notes", (req, res) => {
    db.Note.find({})
        .then( (dbNote) =>
            res.json(dbNote))
        .catch((err) => {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", (req, res) => {
    db.Note.create(req.body)
        .then((dbNote) => {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then((dbArticle) => res.json(dbArticle))
        .catch((err) => res.json(err));
});


// remove the all articel from page
app.get("/clear", (req, res) => {
    db.Article.remove({})
        .then(() => db.Note.remove({}))
        .then(() => {
            res.redirect('/');
        })
})


module.exports = app;
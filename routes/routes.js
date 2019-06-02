    // dependencies
    const axios = require('axios');
    const cheerio = require('cheerio');
    const db = require('../models');

    // source directory
    const weburl = "https://www.androidpolice.com";

    module.exports = (app) => {
    // main page
        app.get('/', (req, res) => {
            db.Article.find({})
                .sort({ timestamp: -1 })
                .then((dbArticle) => res.redirect('/articles'))
                .catch((err) => res.json(err));
        });

    // saved articles page
        app.get('/saved', (req, res) => {
            db.Article.find({ saved: true })
                .then((dbArticle) => {
                    let articleObj = { article: dbArticle };

    // render page with articles found
                    res.render('saved', articleObj);
                })
                .catch((err) => res.json(err));
        });



    // scrape data then save to mongodb
        app.get("/scrape", (req, res) => {
    //  grab the body of the html with axios
            axios.get(weburl).then(response => {
    //  Load response data into cheerio and save it 
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
                        .then(dbArticle => console.log(dbArticle))
                        .catch(err => console.log(err))
                });
                res.redirect("/")
            });

        });


    // show articles after scraping
        app.get('/articles', (req, res) => {
            db.Article.find({})
                .sort({ timestamp: -1 })
                .then((dbArticle) => {
                    let articleObj = { article: dbArticle };
                    res.render('index', articleObj);
                })
                .catch(err => res.json(err));
        });

    // save article

        app.put('/article/:id', (req, res) => {
            let id = req.params.id;
            db.Article.findByIdAndUpdate(id, { $set: { saved: true } })
                .then((dbArticle) => res.json(dbArticle))
                .catch(err => res.json(err));
        });

    // remove article from page 'saved'
        app.put('/article/remove/:id', (req, res) => {
            let id = req.params.id;
            db.Article.findByIdAndUpdate(id, { $set: { saved: false } })
                .then((dbArticle) => res.json(dbArticle))
                .catch(err => res.json(err));
        });

    // clear data from database
        app.get("/clear", (req, res) => {
            db.Article.remove({})
                .then(() => db.Note.remove({}))
                .then(() => res.redirect('/'));
        })


    // get current notes
        app.get('/article/:id', (req, res) => {
            let id = req.params.id;

            // cannot get notes associated with article, only the very first one
            db.Article.findById(id)
                .populate('note')
                .then((dbArticle) => res.json(dbArticle))
                .catch(err => res.json(err));
        });

    // save new note
        app.post('/note/:id', (req, res) => {
            let id = req.params.id;

            db.Note.create(req.body)
                .then((dbNote) => {
                    return db.Article.findOneAndUpdate({
                        _id: id
                    }, {
                            $push: {
                                note: dbNote._id
                            }
                        }, {
                            new: true, upsert: true
                        });
                })
                .then((dbArticle) => res.json(dbArticle))
                .catch(err => res.json(err));
        });



    // delete note
        app.delete('/note/:id', (req, res) => {
            let id = req.params.id;
            db.Note.remove({ _id: id })
                .then(dbNote => res.json({ message: 'note removed!' }))
                .catch(err => res.json(err));
        });
    };
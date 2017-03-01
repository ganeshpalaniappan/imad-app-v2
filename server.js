var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
//var envConfig = require('dotenv').config();

/*var config = {
    user: process.env.DB_UID,
    database: process.env.DB,
    host: 'localhost',
    port: '5432',
    password: process.env.DB_PWD
};*/

var config = {
    user: 'ganeshpalaniappan',
    database: 'ganeshpalaniappan',
    host: '10.140.0.2',
    port: '5432',
    password: 'db-ganeshpalaniappan-46553'
};


var app = express();
app.use(morgan('combined'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

var pool = new Pool(config);
app.get('/articles/:articleName', function (req, res) {
    var articleName = req.params.articleName;
    console.log("Article Name is: " + articleName);
    //pool.query("SELECT * FROM article WHERE title = $1", [articleName], function (err, result) {
    pool.query("SELECT * FROM article", function (err, result) {
        if (err) {
            console.log("In Error Block - connection issue? Message: " + err.message + "Code: " + err.code);
            res.send(err.toString);
        }
        else {
            if (result.rows.length === 0) {
                console.log("Empty 0th row");
                res.send("Article not found");
            }
            else {
                console.log("Creating template");
                res.send(createPageFromTemplate(result.rows[0],"Article-Template.html"));
            }
        }
    });
});

var comments = [];
app.get('/submit-comment', function (req, res) {
    var comment = req.query.comment;
    comments.push(comment);
    res.send(JSON.stringify(comments));
});

app.get('/:pageName', function (req, res) {
    var pageName = req.params.pageName;
    res.send(createPageFromTemplate(pageData[pageName], "server-pageTemplate.html"));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
    res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(8080, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});

function content(title, heading, date, text) {
    this.title = title; this.heading = heading; this.date = date; this.text = text;
};

var pageData = {
    'page1Data': new content("Page 1 Title", "Page 1 Heading", "09-Feb-2017", "Page 1 Content"),
    'page2Data': new content("Page 2 Title", "Page 2 Heading", "10-Feb-2017", "Page 2 Content")
};

function createPageFromTemplate(data,template) {
    if (!data) {
        return 'This page is not available';
    }

    var pageHtmlTemplate = "";
    var fs = require("fs");
    var templatePath = path.join(__dirname, template);

    try {
        pageHtmlTemplate = fs.readFileSync(templatePath, "utf-8");
        pageHtmlTemplate = eval(pageHtmlTemplate);
    } catch (err) {
        console.log(err);
    }

    return pageHtmlTemplate;
};
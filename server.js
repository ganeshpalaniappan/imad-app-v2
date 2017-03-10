var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
const crypto = require('crypto');
const bodyParser = require('body-parser');
const session = require('express-session');
//var envConfig = require('dotenv').config();

var config = {
    user: 'postgres',
    database: 'ganeshpalaniappan',
    host: 'localhost',
    port: '5432',
    password: 'Pr0metheus$'
};

/*var config = {
    user: 'ganeshpalaniappan',
    database: 'ganeshpalaniappan',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: 'db-ganeshpalaniappan-46553'
};*/


var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'MySecret',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },
    resave: true,
    saveUninitialized: true
})); 

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/hash/:input', function (req, res) {
    const secret = req.params.input;
    const salt = crypto.randomBytes(256).toString('hex');
    const pwdStr = hash(secret, salt, 10000);
    res.send(pwdStr);
});

var pool = new Pool(config);
app.post('/create-user', function (req, res) {
    const userName = req.body.username;
    const secret = req.body.password;
    const salt = crypto.randomBytes(256).toString('hex');
    const pwdStr = hash(secret, salt, 10000);

    pool.query('INSERT INTO "user" (username,password) VALUES ($1,$2)', [userName, pwdStr], function (err, result) {
        if (err) {
            res.status(500).send(err.toString());
        }
        else {
            res.send("User sucessfully created: " + userName);
        }
    });
});

app.post('/login', function (req, resp) {
    const userName = req.body.username;
    const secret = req.body.password;

    pool.query('SELECT * FROM "user" WHERE username = $1', [userName], function (err, result) {
        if (err) {
            resp.status(500).send(err.toString());
        }
        else {
            if (result.rows.length === 0) {
                resp.status(403).send("Username/password is invalid");
            }
            else {
                const OrigPwdStr = result.rows[0].password;
                const OrigPwdArr = OrigPwdStr.split('$');
                const targetHashedPwd = hash(secret, OrigPwdArr[3], Number(OrigPwdArr[2]));
                if (OrigPwdStr === targetHashedPwd) {
                    req.session.auth = { userid: result.rows[0].userid };
                    resp.send("Credentials correct!");
                }
                else {
                    resp.status(403).send("Username/password is invalid");
                }

            }
        }
    });
});

app.get('/check-session', function (req, resp) {
    if (req.session && req.session.auth && req.session.auth.userid) {
        resp.send("You are logged in as: " + req.session.auth.userid.toString());
    }
    else {
        resp.send("You are not logged in");
    }
});

app.get('/logout', function (req, resp) {
    if (req.session && req.session.auth) {
        req.session.auth = null;
    }
    resp.send("Logged out");
});

app.get('/articles/:articleName', function (req, resp) {
    var articleName = req.params.articleName;
    pool.query("SELECT * FROM article WHERE title = $1", [articleName], function (err, result) {
        if (err) {
            resp.status(500).send(err.toString());
        }
        else {
            if (result.rows.length === 0) {
                resp.status(400).send("Article not found");
            }
            else {
                resp.send(createPageFromTemplate(result.rows[0],"Article-Template.html"));
            }
        }
    });
});

app.get('/get-articles', function (req, resp) {
    pool.query("SELECT title, modified_date FROM article order by title", function (err, result) {
        if (err) {
            resp.status(500).send(err.toString());
        }
        else {
            if (result.rows.length === 0) {
                resp.status(400).send("Articles not found");
            }
            else {
                resp.send(JSON.stringify(result.rows));
            }
        }
    });
});

app.post('/submit-comment', function (req, resp) {
    let comment = req.body.comment;
    let article_id = req.body.article_id;
    if (!(req.session && req.session.auth && req.session.auth.userid)) {
        resp.status(500).send("Invalid session object");
    }

    pool.query('INSERT INTO comment (user_id,article_id,comment) VALUES ($1,$2,$3)', [req.session.auth.userid, article_id, comment],
        function (err, result) {
            if (err) {
                resp.status(500).send(err.toString());
            }
            else {
                resp.send("Comment created successfully");
            }
        });
});

/*app.get('/:pageName', function (req, res) {
    var pageName = req.params.pageName;
    res.send(createPageFromTemplate(pageData[pageName], "server-pageTemplate.html"));
});*/

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
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});

function hash(secret, salt, iterations) {
    const hashKey = crypto.pbkdf2Sync(secret, salt, iterations, 512, 'sha512');
    const pwdStr = ['sha512', 512, iterations, salt, hashKey.toString('hex')].join('$');
    return pwdStr;
};

/*function content(title, heading, date, text) {
    this.title = title; this.heading = heading; this.date = date; this.text = text;
};*/

/*var pageData = {
    'page1Data': new content("Page 1 Title", "Page 1 Heading", "09-Feb-2017", "Page 1 Content"),
    'page2Data': new content("Page 2 Title", "Page 2 Heading", "10-Feb-2017", "Page 2 Content")
};*/

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
require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const routes = require('./routes/routes');
const session = require("express-session");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require('fs');

const db = require("./src/models/db");
(async () => {
    await db.getConnection();
})();


app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'templates'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.use(session({
    secret: 'key bidon', 
    resave: false, 
    saveUninitialized: true, 
    cookie: {maxAge: 3600000} 
}));
app.use((req, res, next) => {
    res.locals.session = req.session; 
    res.locals.route = req.originalUrl;
    next();
});

if (process.env.APP_ENV === "prod") {
    const logFile = path.join(__dirname, 'prod.log');
    const stream = fs.createWriteStream(logFile, {flags: 'a'});
    app.use(morgan("combined", {
        stream: stream
    }));
}

app.use('/', routes);

const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(process.env.DOMAIN)
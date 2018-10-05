const express = require('express');
let app = express();

const Greetings = require('./greetings');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const pg = require('pg');
const flash = require('express-flash');
const session = require('express-session');

// initialise session middleware - flash-express depends on it
app.use(session({
  secret: "this line for an error message",
  resave: false,
  saveUninitialized: true
}));


const Pool = pg.Pool;


// should we use a SSL connection
let useSSL = false;
const local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}
// initialise the flash middleware
app.use(flash());

// which db connection to use
const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost/greetings';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});
// instance
const greetMe = Greetings(pool);

// app.use(session({
//     secret: 'keyboard cat5 run all 0v3r',
//     resave: false,
//     saveUninitialized: true
// }));

// handlebars
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', async function (req, res) {
    try {
        let count = await greetMe.greetCounter();
        console.log(count);
        
        res.render('home', { count });
    } catch (err) {
        res.redirect('/');
        console.error('cant get counter', err);
    }
});

app.post('/greet', async function (req, res, next) {
    try {
    let name = req.body.name;
    let language = req.body.language;
    console.log(name,language)
    
        if (!name && !language ) {  
          req.flash('error','Please enter a name and select a language');
          return  res.redirect('/');
        }
        
        if (!name) {
            req.flash('error','Please enter a name');
          return res.redirect('/');
        }

        if (!language) {
            req.flash('error','Please select a language');
          return res.redirect('/');
        }
        
        let greetName = await greetMe.greetingName(language, name);
        let count = await greetMe.greetCounter();

        res.render('home', { greetName, count });
    } catch (err) {
        console.log('Can not post to database', err);
    }
});

app.get('/action', async function (req, res, next) {
    try {
        let greetings = await greetMe.all();

        res.render('action', { greetings });
    } catch (err) {
        console.error('Does want to get names from database', err);
    }
});


app.get('/counter/:username', async function(req, res, next){
try{
   let personName = req.params.username;
   let returnName = await greetMe.singleName(personName);
   res.render('greeted', returnName)
} catch (err) {
    console.error('resets the button', err);
}

});
app.post('/resetBtn', async function (req, res) {
    try {
        await greetMe.resetBtn();
        res.redirect('/');
    } catch (err) {
        console.error('resets the button', err);
    }
});

app.post('/add', async function (req, res) {
    try {
        const personName = req.body.greeted_names;
        if (personName && personName !== '') {
            await pool.query('insert into greetz (greeted_names, spotted_greetings) values ($1, $2)', [personName, 1]);
            res.redirect('/');
        }
    } catch (err) {
        res.send(err.stack);
    }
});




app.post('/greeted', async function (req, res) {
    try {
        const personName = req.body.greeted_names;
        if (personName && personName !== '') {
            await pool.query('insert into greetz (greeted_names, spotted_greetings) values ($1, $2)', [personName, 1]);
        }

        res.render('action');
    } catch (err) {
        res.send(err.stack);
    }
});

const PORT = process.env.PORT || 3688;
app.listen(PORT, function () {
    console.log('App starting on port', PORT);
});

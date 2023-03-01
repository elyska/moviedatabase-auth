/*  _____ _______         _                      _
* |_   _|__   __|       | |                    | |
*   | |    | |_ __   ___| |___      _____  _ __| | __  ___ ____
*   | |    | | '_ \ / _ \ __\ \ /\ / / _ \| '__| |/ / / __|_  /
*  _| |_   | | | | |  __/ |_ \ V  V / (_) | |  |   < | (__ / /
* |_____|  |_|_| |_|\___|\__| \_/\_/ \___/|_|  |_|\_(_)___/___|
*                                _
*              ___ ___ ___ _____|_|_ _ _____
*             | . |  _| -_|     | | | |     |  LICENCE
*             |  _|_| |___|_|_|_|_|___|_|_|_|
*             |_|
*
* IT ZPRAVODAJSTVÍ  <>  PROGRAMOVÁNÍ  <>  HW A SW  <>  KOMUNITA
*
* Tento zdrojový kód je součástí výukových seriálů na
* IT sociální síti WWW.ITNETWORK.CZ
*
* Kód spadá pod licenci prémiového obsahu a vznikl díky podpoře
* našich členů. Je určen pouze pro osobní užití a nesmí být šířen.
* Více informací na http://www.itnetwork.cz/licence
*/
const API_PORT = 3000;
const mongoose = require("mongoose");
const Joi = require('joi');
const express = require('express');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const app = express();
app.use(express.json());
app.listen(API_PORT, () => console.log('Listening on port ' + API_PORT + '...'));

// DB connection ----------------------------------------------------------
mongoose
    .connect("mongodb://localhost:27017/moviesdb", { useNewUrlParser: true })
    .then(() => console.log("Connected to MongoDB!"))
    .catch(error => console.error("Could not connect to MongoDB... ", error));
// -----------------------------------------------------------------------------


// Mongoose schemas ------------------------------------------------------
const movieSchema = new mongoose.Schema({
    name: String,
    year: Number,
    directorID: mongoose.Schema.Types.ObjectId,
    actorIDs: [mongoose.Schema.Types.ObjectId],
    genres: [String],
    isAvailable: Boolean,
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

const personSchema = new mongoose.Schema({
    name: String,
    birthDate: Date,
    country: String,
    biography: String,
    role: String // "actor" nebo "director"
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const refreshTokenSchema = new mongoose.Schema({
    token: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    expiryDate: Date
});

const Movie = mongoose.model("Movie", movieSchema);
const Person = mongoose.model("Person", personSchema);
const User = mongoose.model("User", userSchema);
const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
// -----------------------------------------------------------------------------

const genres = ["sci-fi", "adventure", "action", "romantic", "animated", "comedy"];
const secret = "top_secret";
const accessTokenExpiresIn = 10 * 60 * 1000;
const refreshTokenExpiresIn = 1000 * 60 * 60 * 24 * 7;

function createRefreshToken(user) {
    const refreshToken = {
        token: crypto.randomBytes(48).toString("hex"),
        user: user._id,
        expiryDate: new Date(Date.now() + refreshTokenExpiresIn)
    };

    RefreshToken.create(refreshToken)
        .catch(err => { res.send(err.message) });

    return refreshToken;
};

function createAccessToken(user) {
    return jwt.sign({ id: user._id, email: user.email }, secret, {
        expiresIn: accessTokenExpiresIn / 1000
    });
};

// Validation functions --------------------------------------------------------
function validatePerson(person, required = true)
{
    const schema = Joi.object({
        name:           Joi.string().min(3),
        birthDate:   	Joi.date(),
        biography:    	Joi.string().min(10),
        country:        Joi.string().min(2),
        role:           Joi.string().valid("actor", "director")
    });

    return schema.validate(person, { presence: (required) ? "required" : "optional" });
}

function validateMovie(movie, required = true) {
    const schema = Joi.object({
        name:           Joi.string().min(3),
        directorID:   	Joi.string(),
        actorIDs:		Joi.array(),
        isAvailable:    Joi.bool(),
        // genres:         Joi.array().valid(...genres).min(1),
        genres:         Joi.array().items(Joi.string().valid(...genres)).min(1),
        year:           Joi.number()
    });

    return schema.validate(movie, { presence: (required) ? "required" : "optional" });
}

function validateGet(getData)
{
    const schema = Joi.object({
        limit: 		Joi.number().min(1),
        fromYear: 	Joi.number(),
        toYear: 	Joi.number(),
        genre: 		Joi.string().valid(...genres),
        select: 	Joi.string(),
        directorID: Joi.string().min(5),
        actorID: 	Joi.string().min(5)
    })
    return schema.validate(getData, { presence: "optional" });
}

function validateUser(user, required = true) {
    const schema = Joi.object({
        email:      Joi.string(),
        password:   Joi.string().min(8)
    });
    return schema.validate(user, { presence: (required) ? "required" : "optional" });
}

function validateRefreshToken(token, required = true) {
    const schema = Joi.object({
        refreshToken:      Joi.string()
    });
    return schema.validate(token, { presence: (required) ? "required" : "optional" });
}

function checkDuplicateEmail(req, res, next) {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (user) {
            res.status(400).send({ message: "Tento email je již použit!" });
            return;
        }

        next();
    });
};

function verifyToken(req, res, next) {
    let token = req.headers["access-token"];

    if (!token) {
        return res.status(403).send({ message: "Nebyl poskytnut žádný token!" });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Token je neplatný nebo vypršel!" });
        }
        next();
    });
};

function verifyRefreshTokenExpiration(token) {
    return token.expiryDate.getTime() < new Date().getTime();
}
// -----------------------------------------------------------------------------

// GET requests ----------------------------------------------------------------
app.get('/api/movies', [verifyToken], (req, res) => {
    const { error } = validateGet(req.query);
    if (error)
    {
        res.status(404).send(error.details[0].message);
        return;
    }

    let dbQuery = Movie.find();
    if (req.query.select)
        dbQuery = dbQuery.select(req.query.select);

    if (req.query.directorID)
        dbQuery = dbQuery.where("directorID", req.query.directorID);

    if (req.query.actorID)
        dbQuery = dbQuery.where("actorIDs", req.query.actorID);

    if (req.query.genre)
        dbQuery = dbQuery.where("genres", req.query.genre);

    if (req.query.fromYear)
        dbQuery = dbQuery.where("year").gte(req.query.fromYear);

    if (req.query.toYear)
        dbQuery = dbQuery.where("year").lte(req.query.toYear);

    if (req.query.limit)
        // dbQuery = dbQuery.limit(req.query.limit);
        dbQuery = dbQuery.limit(parseInt(req.query.limit));

    dbQuery
        .then(movies => { res.json(movies) })
        .catch(err => { res.status(400).send("Požadavek na filmy selhal!"); });
});

app.get('/api/genres', [verifyToken], (req, res) => {
    res.json(genres);
});

async function getMovieByID(id)
{
    let movie = await Movie.findById(id);
    if (movie)
    {
        movie = movie.toJSON();
        let director = await Person.findById(movie.directorID).select("_id name");
        let actors = await Person.find().where("_id").in(movie.actorIDs).select("_id name");
        movie.director = director.toJSON();
        movie.actors = JSON.parse(JSON.stringify(actors));
    }
    return movie;
}

app.get('/api/movies/:id', [verifyToken], (req, res) => {
    getMovieByID(req.params.id)
        .then(movie => {
            if (movie)
                res.send(movie);
            else
                res.status(404).send("Film s daným id nebyl nalezen!");
        })
        .catch(err => { res.status(400).send("Chyba požadavku GET na film!") });
});

app.get('/api/people/:id', [verifyToken], (req, res) => {
    Person.findById(req.params.id, (err, person) => {
        // if (err || !result)
        if (err)
            res.status(404).send("Člověk s daným ID nebyl nalezen.");
        else
            res.json(person);
    });
});

app.get('/api/actors', [verifyToken], (req, res) => {
    const { error } = validateGet(req.query);
    if (error)
    {
        res.status(400).send(error.details[0].message);
        return;
    }

    let dbQuery = Person.find().where("role", "actor");

    if (req.query.limit)
        // dbQuery = dbQuery.limit(req.query.limit);
        dbQuery = dbQuery.limit(parseInt(req.query.limit));

    dbQuery.then(actors => { res.json(actors); })
        .catch(err => { res.status(400).send("Chyba požadavku na herce!"); });
});

app.get('/api/directors', [verifyToken], (req, res) => {
    const { error } = validateGet(req.query);
    if (error)
    {
        res.status(400).send(error.details[0].message);
        return;
    }

    let dbQuery = Person.find().where("role", "director");

    if (req.query.limit)
        // dbQuery = dbQuery.limit(req.query.limit);
        dbQuery = dbQuery.limit(parseInt(req.query.limit));

    dbQuery.then(directors => { res.json(directors); })
        .catch(err => { res.status(400).send("Chyba požadavku na režiséry!"); });
});

// ---------------------------------------------------------------------------

// POST requests -------------------------------------------------------------
app.post('/api/movies', [verifyToken], (req, res) => {
    const { error } = validateMovie(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Movie.create(req.body)
            .then(result => { res.json(result) })
            .catch(err => { res.send("Nepodařilo se uložit film!") });
    }
});

app.post('/api/people', [verifyToken], (req, res) => {
    const { error } = validatePerson(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Person.create(req.body)
            .then(result => { res.json(result) })
            .catch(err => { res.send("Nepodařilo se uložit osobu!") });
    }
});

app.post('/api/auth/register', [ checkDuplicateEmail ], (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 8)
        });

        User.create(user)
            .then(result => { res.json({ id: result._id, email: result.email }) })
            .catch(err => { res.send("Uživatele se nepodařilo zaregistrovat!") });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { error } = validateUser(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        User.findOne({
            email: req.body.email
        }).exec(async (err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: "Uživatel nenalezen!" });
            }

            const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

            if (!passwordIsValid) {
                return res.status(401).json({
                    accessToken: null,
                    message: "Nesprávné heslo!"
                });
            }

            const token = createAccessToken(user);
            const refreshToken = createRefreshToken(user);

            res.status(200).json({
                id: user._id,
                email: user.email,
                accessToken: token,
                accessTokenExpirationDate: new Date(Date.now() + accessTokenExpiresIn),
                refreshToken: refreshToken.token
            });
        });
    }
});

app.post('/api/auth/refreshtoken', async (req, res) => {
    const { error } = validateRefreshToken(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        const refreshToken = await RefreshToken.findOne({ token: req.body.refreshToken });

        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token není v databázi!" });
            return;
        }

        if (verifyRefreshTokenExpiration(refreshToken)) {
            RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();

            res.status(403).json({
                message: "Refresh token vypršel. Přihlaste se prosím znovu!",
            });
            return;
        }

        const newRefreshToken = createRefreshToken(refreshToken.user);
        RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
        const newAccessToken = createAccessToken(refreshToken.user);

        res.status(200).json({
            accessToken: newAccessToken,
            accessTokenExpirationDate: new Date(Date.now() + accessTokenExpiresIn),
            refreshToken: newRefreshToken.token
        });
    }
});
// -----------------------------------------------------------------------------

// PUT requests ----------------------------------------------------------------
app.put('/api/movies/:id', [verifyToken], (req, res) => {
    const { error } = validateMovie(req.body, false);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Movie.findByIdAndUpdate(req.params.id, req.body, { new: true } )
            .then(result => { res.json(result) })
            .catch(err => { res.send("Nepodařilo se uložit film!") });
    }
});

app.put('/api/people/:id', [verifyToken], (req, res) => {
    const { error } = validatePerson(req.body, false);
    if (error) {
        res.status(400).send(error.details[0].message);
    } else {
        Person.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .then(result => { res.json(result) })
            .catch(err => { res.send("Nepodařilo se uložit osobu!") });
    }
});
// -----------------------------------------------------------------------------

// DELETE requsets ------------------------------------------------------------------
app.delete('/api/movies/:id', [verifyToken], (req, res) => {
    Movie.findByIdAndDelete(req.params.id)
        .then(result => {
            if (result)
                res.json(result);
            else
                res.status(404).send("Film s daným id nebyl nalezen!");
        })
        .catch(err => { res.send("Chyba při mazání filmu!") });
});

app.delete('/api/people/:id', [verifyToken], (req, res) => {
    Movie.find({ $or: [{ actorIDs: req.params.id }, { directorID: req.params.id }] }).countDocuments()
        .then(count => {
            console.log(count);
            if (count != 0)
                res.status(400).send("Nelze smazat osobu, která je přiřazena k alespoň jednomu filmu!");
            else
            {
                Person.findByIdAndDelete(req.params.id)
                    .then(result => { res.json(result) })
                    .catch(err => { res.send("Nepodařilo se smazat osobu!") });
            }
        }).catch(err => { res.status(400).send("Nepodařile se smazat osobu!") });
});

app.delete('/api/auth/revokerefreshtoken/:refreshtoken', (req, res) => {
    RefreshToken.findOne({ token: req.params.refreshtoken }).then(refreshToken => {
        if (!refreshToken) {
            res.status(403).json({ message: "Refresh token není v databázi!" });
            return;
        }

        RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
        res.status(200).send("Odhlášen!");
    });
});
// -----------------------------------------------------------------------------
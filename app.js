
import express from 'express';

import rateLimit from 'express-rate-limit';
import errorHandler from 'errorhandler';
import morgan from 'morgan';

import bodyParser from 'body-parser';
import { readFileSync } from 'fs';

const app = express();
const port = 23706;

const COLE_LOCAL = false;
const COURSES = JSON.parse(readFileSync("./includes/courses.json").toString());
const BOOKS = JSON.parse(readFileSync("./includes/books.json").toString()).map((book, i) => {
    const newId = `${i}-${book.title.replaceAll(" ", "")}`;
    return {
        id: newId,
        ...book
    }
});

const COURSE_IDS = COURSES.map(c => c.id);
const CODES = COLE_LOCAL ? readFileSync( "./codes.secret").toString().split(",") : process.env["CS272_CODES"].split(",");
const BIDS = COLE_LOCAL ? readFileSync( "./bids.secret").toString().split(",") : process.env["CS272_BIDS"].split(",");

const FAVORITES_MAP = CODES.reduce((acc, curr) => {
    return {
        ...acc,
        [curr]: []
    }
}, {})


app.use(morgan(':date ":method :url" :status :res[content-length] - :response-time ms'));

morgan.token('date', function () {
    var p = new Date().toString().replace(/[A-Z]{3}\+/, '+').split(/ /);
    return (p[2] + '/' + p[1] + '/' + p[3] + ':' + p[4] + ' ' + p[5]);
});

process.on('uncaughtException', function (exception) {
    console.log(exception);
});

process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

app.use(errorHandler());

// JSON Body Parser Configuration
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// // Request Throttler
app.set('trust proxy', 1);
const limiter = rateLimit({
    windowMs: 30 * 1000, // 30 seconds
    max: 15, // limit each id to 15 requests per windowMs (30 seconds)
    keyGenerator: (req, _) => req.header('Authorization') ?? Math.random().toString() // throttle on X-CS272-ID, fallback
});
app.use(limiter);

// Allow CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    next();
});

function handleAuthorization(req, res) {
    const code = req.header("Authorization");
    if (!code?.startsWith("Bearer ")) {
        res.status(401).send({
            msg: "Your request must include an Authorization header beginning with Bearer!"
        });
        return undefined;
    } else {
        const authCode = code.split(" ")[1].toUpperCase();
        if (!CODES.includes(authCode)) {
            res.status(401).send({
                msg: "Invalid Authorization Code!"
            });
            return undefined;
        } else {
            return authCode;
        }
    }
}

app.get("/rest/s26/hw9/books", (req, res) => {
    res.status(200).set('Cache-control', 'public, max-age=60').send(BOOKS);
});

// Don't re-invent the wheel, proxy it!
app.post("/rest/s26/hw10/ai", async (req, res) => {
    const code = handleAuthorization(req, res);
    if (code) {
        const r = await fetch("http://cs571api.cs.wisc.edu/rest/s26/hw10/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CS571-ID": BIDS[CODES.indexOf(code)]
            },
            body: JSON.stringify(req.body)
        });
        const status = r.status;
        const body = await r.json();
        res.status(status).send(body);
    }
});

app.get("/rest/s26/ice/courses-slow", (req, res) => {
    setTimeout(() => {
        res.status(200).send(COURSES);
    }, 1000)
});

app.get("/rest/s26/ice/courses", (req, res) => {
    res.status(200).set('Cache-control', 'public, max-age=60').send(COURSES);
});

app.get("/rest/s26/ice/favorites", (req, res) => {
    const code = handleAuthorization(req, res);
    if (code) {
        res.status(200).send({
            msg: "Successfully retrieved favorites!",
            favs: FAVORITES_MAP[code]
        })
    }
});

app.post("/rest/s26/ice/favorites", (req, res) => {
    const code = handleAuthorization(req, res);
    if (code) {
        const courseId = req.query?.courseId;
        if (courseId && COURSE_IDS.includes(courseId)) {
            const myFavs = FAVORITES_MAP[code];
            if (myFavs.includes(courseId)) {
                res.status(409).send({
                    msg: "That course is already favorited!"
                });
            } else {
                myFavs.push(courseId);
                res.status(200).send({
                    msg: "Added course to favorites!"
                });
            }
        } else {
            res.status(400).send({
                msg: "Please specify a valid course ID!"
            });
        }
    }
});

app.delete("/rest/s26/ice/favorites", (req, res) => {
    const code = handleAuthorization(req, res);
    if (code) {
        const courseId = req.query?.courseId;
        if (courseId && COURSE_IDS.includes(courseId)) {
            const myFavs = FAVORITES_MAP[code];
            if (!myFavs.includes(courseId)) {
                res.status(404).send({
                    msg: "That course is not favorited!"
                });
            } else {
                FAVORITES_MAP[code] = myFavs.filter(c => c !== courseId);
                res.status(200).send({
                    msg: "Removed course from favorites!"
                });
            }
        } else {
            res.status(400).send({
                msg: "Please specify a valid course ID!"
            });
        }
    }
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err)
    let datetime = new Date();
    let datetimeStr = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`;
    console.log(`${datetimeStr}: Encountered an error processing ${JSON.stringify(req.body)}`);
    res.status(500).send({
        "error-msg": "Oops! Something went wrong. Check to make sure that you are sending a valid request. Your recieved request is provided below. If it is empty, then it was most likely not provided or malformed. If you have verified that your request is valid, please contact the CS272 staff.",
        "error-req": JSON.stringify(req.body),
        "date-time": datetimeStr
    })
});

// Open Server for Business
app.listen(port, () => {
    console.log(`CS272 API :${port}`)
});
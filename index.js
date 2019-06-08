import DatabaseHelper from './database'
const helper = new DatabaseHelper()
const express = require('express');
const app = express();
var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

helper.initializeTables()

app.get('/', (request, response) => {
    response.send('Hello, World!')
});

app.use((request, response, next) => {
    console.log(`${request.method} ${request.url}: ${new Date()}`);
    next();
});

app.get('/user/login/:login/:password', (request, response) => {
    console.log(request.params)
    helper.login(request.params.login, request.params.password)
        .then((id) => {
            // response.sendStatus(200)
            console.log(id)
            response.sendStatus(200)
        })
        .catch(() => {
            response.sendStatus(401)
        })

});

app.get('/user/register/:login/:password', (request, response) => {
    const validate = helper.validateLogin(request.params.login, request.params.password)
    if (validate.val) {
        helper.login(request.params.login, request.params.password)
            .then(() => {
                response.sendStatus(401)
            })
            .catch(() => {
                helper.addNewUser(request.params.login, request.params.password);
                response.sendStatus(200);
            })
    } else {
        response.send(validate.text)
    }

});

app.get('/user/scores/:name', (request, response) => {
    helper.getAllUserScores(request.params.name)
        .then((data) => {
            response.send(data);
        })
})

app.get('/user/newScore/:login/:value', (request, response) => {
    console.log(request.params)
        helper.getUserIdByLogin(request.params.login)
            .then((id) => {
                helper.addNewScore(id, request.params.value)
                    .then(() => {
                        response.sendStatus(200);
                    })
            })
})

app.get('/top', (request, response) => {
    helper.getTopScores()
        .then(data => {
            console.log(data)
            response.status(200).send(data)
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/user/record/:login', (request, response) => {
    if(helper.validateLogin(request.params.login)) {
        helper.getUserIdByLogin(request.params.login)
            .then(id => {
                helper.getUserRecord(id)
                    .then(record => {
                        response.send(record);
                    })
                    .catch(err => {
                        response.sendStatus(404);
                    })
            })
    } else {
        response.sendStatus(404);
    }
});


app.listen(3000, '0.0.0.0', () => {
    console.log('Server running !');
});
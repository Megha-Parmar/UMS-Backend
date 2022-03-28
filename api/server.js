const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const data = require("./db.json");
const nocache = require("nocache");


// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser)

server.use((req, res, next) => {
    res.header('X-Hello', 'World')
    if (!req.url.includes("/api/auth/user")) {
        let username = req.headers["username"]
        let isFoundUser = data.user.find((obj) => obj.username == username);
        if (!isFoundUser) {
            res.sendStatus(401);
        }
    }
    next()
});
server.use((req, res, next) => {
    if (req.method === 'POST') {
        req.body.createdAt = Date.now()
    }
    // Continue to JSON Server router
    next()
})

server.use(middlewares)
// Add this before server.use(router)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/auth/*': '/user',
}));


server.use(nocache())
server.use(router)
server.listen(3000, () => {
    console.log('JSON Server is running')
})

router.render = (req, res) => {
    // console.log("res.locals.data", res)
    // console.log("res.locals.data", res.locals.data)
    if (res.statusCode == 200 || res.statusCode == 201) {
        res.jsonp({
            status_code: 200,
            success: true,
            body: res.locals.data,
            totalData: data.user.length
        })
    } else {
        let errMessage = "";
        switch (res.statusCode) {
            case 404:
                errMessage = 'Data Not Found'
                break;
            case 401:
                errMessage = 'Unauthorized user'
                break;
            case 500:
                errMessage = 'Something went wrong'
                break;
        }
        res.status(res.statusCode).jsonp({
            error: errMessage,
            status_code: res.statusCode,
            success: false,
        })
    }
}
// router.render = (req, res) => {
//     console.log('res', res.locals)
//     res.status(500).jsonp({
//         error: "error message here"
//     })
// }
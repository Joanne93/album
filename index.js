var server = require("./router/server.js");
var router = require("./router/router.js");



server.start(router.route);
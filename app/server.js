var express = require('express');
var serveStatic = require('serve-static');
var requestProxy = require('express-request-proxy');
var config = require('config');
var app = express();
var servicesPath = "/v1/catalog/services";
var servicePath = "/v1/catalog/service/:service_name";
var consulConfig = config.get('Consul');
var serverConfig = config.get('Server');

// Serve static files from "dist folder"
// you can create that with "gulp"
app.use(serveStatic('dist', {'index': ['index.html']}))

// List of services
app.get('/api/v1/catalog/services', requestProxy({
  url: consulConfig.protocol+'://'+consulConfig.host+servicesPath
}));

// Service's nodes
app.get('/api/v1/catalog/service/:service_name', requestProxy({
  url: consulConfig.protocol+'://'+consulConfig.host+servicePath
}));


app.listen(serverConfig.port, function () {
  console.log('App listening on port '+serverConfig.port);
});

var mvc = window.MyApp.mvc = require('./scripts/utils/mvc.js');

var router = window.MyApp.router = require('./scripts/utils/router.js');

router.controllers({
  dashboard  : require('./scripts/controllers/dashboard.js')
}).routes({
  '/' : 'dashboard.show',
}).register();

router.start();

// Reload every 60 seconds
setTimeout(function(){
   window.location.reload(1);
}, 60000);


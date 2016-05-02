var mvc = require('../utils/mvc.js');

// i-16aa2d92.eden-accel-api.prod-blue.px.use1 => prod-blue.px.use1
function cleanNodeName(name){
  var nameParts = name.split('.');
  nameParts.shift();
  nameParts.shift();
  return nameParts.join('.');
}

// service-eden-accel-api-8110 => service eden accel api
function cleanServiceName(name) {
  var serviceNameParts = name.split('-');
  if (! isNaN(serviceNameParts[serviceNameParts.length -1])){  serviceNameParts.pop();}
  return serviceNameParts.join(' ');
}

// assuming "prod...", "stg..", "qa..." or "prod-blue", "prod-green", etc...
function sortProdStgQa(a, b){
  if(a['niceName'][0] == b['niceName'][0]){
    if(a['niceName'][0] == 'p') {
      if (a['niceName'][5] == b['niceName'][5]){
        return 0;
      }
      if (a['niceName'][5] == 'b') {
        return 1;
      }
      if (b['niceName'][5] == 'b') {
        return -1;
      }
    }

    if(a['niceName'][0] == 's') {
      if (a['niceName'][4] == b['niceName'][4]){
        return 0;
      }
      if (a['niceName'][4] == 'b') {
        return 1;
      }
      if (b['niceName'][4] == 'b') {
        return -1;
      }
    }
  }

  if(a['niceName'][0] == 'p') {
    return -1;
  }

  if(b['niceName'][0] == 'p') {
    return 1;
  }

  if(a['niceName'][0] == 's') {
    return -1;
  }

  if(b['niceName'][0] == 's') {
    return 1;
  }

  if (a['niceName'][0] == 'q') {
    return 1;
  }
  if (b['niceName'][0] == 'q') {
    return -1;
  }
  
  return 0;
}


var dashboard = mvc.newController({
  show : function(params) {
    console.log('dashboard');
    var self = this;

    $.ajax( "/api/v1/catalog/services")
      .done(function(data) {
        console.log('got api/v1/catalog/services');
        MyApp.data = {services: data};
        var templateParams = $.extend({}, {services : data});
        self.render(MyApp.templates.dashboard(templateParams));
        var service_keys = [];
        $.each(MyApp.data.services,function(key){
          if (! new RegExp("consul|redis|jmx").test(key)){
            service_keys.push(key);
          }
        });
        service_keys.sort();
        $.each(service_keys, function(idx, key) {
          $.ajax( "/api/v1/catalog/service/"+key)
            .done(function(service_data) {
              MyApp.data['service-'+key] = service_data;
              $.each(service_data, function(idx, obj){
                obj['niceName'] = cleanNodeName(obj['Node']);
                obj['classes'] =  obj['niceName'].match('prod|stg|qa');
                if (obj['niceName'].match('green|blue')) {
                  obj['classes'] +=  obj['niceName'].match('green|blue');
                }
              });
              service_data.sort();
              service_data.sort(sortProdStgQa);
              var serviceParams = $.extend({serviceName: cleanServiceName(key)}, {nodes : service_data});
              mvc.addCard(MyApp.templates.cards.service(serviceParams));
            })
            .fail(function(){
              console.log('FAIL: got api/v1/catalog/service'+key);
            });
        });
      })
      .fail(function() {
        console.log('FAIL: got api/v1/catalog/services');
        return mvc.renderError('Could not get list of services.', '404');
      });
  }
});

module.exports = dashboard;




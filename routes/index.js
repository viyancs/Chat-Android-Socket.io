
/*
 * GET home page.
 */

var http = require('http');
exports.index = function(req, res){
  res.render('index', { title: 'Express' })
};

    /*  
     * GET twitter search results  
     */  
    exports.twitter = function(req, res) {  
      var options = {  
        host: 'search.twitter.com',  
        port: 80,  
        path: '/search.json?q=sitepoint&rpp=10'  
      };  
      http.get(options, function(response) {  
        var tweets = '';  
        response.on('data', function(data) {  
          tweets += data;  
        }).on('end', function() {  
          var tmp = JSON.parse(tweets),  
            topTen = tmp.results;  
          res.render('twitter', { title: 'Latest from Twitter', tweets: topTen });  
        });  
      }).on('error', function(e) {  
        res.writeHead(500);  
        res.write('Error: ' + e);  
      });  
    }  

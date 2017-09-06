var request = require('request');
var cheerio = require('cheerio');

request('http://www.nationsonline.org/oneworld/countries_of_the_world.htm#A', function (error, response, html) {
 if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
 
   $('tr td.tdb').each(function(i,ele){
   var arr = [];
   var a = $(this).prev();
   var b  = a.text();
   
   arr.push(b);
   console.log(arr);
   });
  }
});
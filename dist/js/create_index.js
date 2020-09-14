var elasticlunr = require('./elasticlunr.js'),
    fs = require('fs');

var idx = elasticlunr(function () {
  this.setRef('id');

//  this.addField('question');
  this.addField('comment');
//  this.addField('source');
  this.addField('c1');
  this.addField('c2');
  this.addField('c3');
  this.addField('c4');
//    this.addField('country');
    
});
var fileName = "data6";

fs.readFile('./'+fileName+'.json', function (err, data) {
  if (err) throw err;

  var raw = JSON.parse(data);

  var questions = raw.map(function (q) {
    return {
      id: "Q"+q.question.substring(0, q.question.indexOf("."))+"."+q.country,
      qn: q.question.substring(0, q.question.indexOf(".")),
      question: q.question,
      comment: q.ac,
      source: q.as,
      c1:q.c1,
      c2:q.c2,
      c3:q.c3,
      c4:q.c4,
      band: q.band.split("_")[1],
      country: q.country,
      score: +q.score,
    };
  });

  questions.forEach(function (question) {
//    console.log(question);
    idx.addDoc(question);
  });

  fs.writeFile('./'+fileName+'_index.json', JSON.stringify(idx), function (err) {
    if (err) throw err;
    console.log('done');
  });
});
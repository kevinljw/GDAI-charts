require([
  'dist/js/jquery.js',
  'dist/js/mustache.js',
  'text!templates/single_country.mustache',
  'text!data6.json',
//  'text!example_data.json',
//  'text!example_index.json',
], function (_, Mustache, singleQuestion, data) {
    
    var renderQuestionList = function (qs) {
        var countryName = qs[0].country || "";
        var bandValue = qs[0].band || "";
        $("#country-show")
          .empty()
          .append(Mustache.to_html(singleQuestion, {questions: qs, countryName:countryName, bandValue: bandValue}));
        markContent();
    };
    var markContent = function () {
      
        var context = document.querySelector("#country-show");
        var instance = new Mark(context);
        var queryStr = $('#mark-form input[name="mark"]').val();
        instance.unmark({
          done: function() {
            instance.mark(queryStr, {element:"span", className:"qs"});
          }
        });
        
    };
    
    var questions = JSON.parse(data).map(function (q) {
        return {
          id: "Q"+q.question.substring(0, 2)+"."+q.country,
          qn: q.question.substring(0, 2),
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
          facets: q.facets 
        }
    });
    var getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
    
    var c = getUrlParameter('c');
    if(c==null) q="Taiwan";
    
    var m = getUrlParameter('m');
    if(m==null) m="";
    $('#mark-form input[name="mark"]').val(m);

    $('#mark-form').on("submit", function(e) {
          e.preventDefault();
          markContent();
    });
    console.log(c,m);
    
    var results = questions.filter(function (eachQ) { return c === eachQ.country });
//    console.log(results);
    renderQuestionList(results);
});
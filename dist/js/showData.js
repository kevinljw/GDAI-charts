require([
  'dist/js/jquery.js',
  'dist/js/mustache.js',
  'text!templates/single_question.mustache',
  'text!templates/wordcloud_view.mustache',
  'text!data6.json',
//  'text!example_data.json',
//  'text!example_index.json',
], function (_, Mustache, singleQuestion, wordcloudView, data) {
    
    var renderQuestionList = function (qs,qn,co) {
        $("#single-question-show")
          .empty()
          .append(Mustache.to_html(singleQuestion, {thisQues: qs, qNum: qn, countryName: co}));
        
        $("#q-select option[value='" + qs.qn + "']").attr("selected", true);
        $("#c-select option[value='" + qs.country + "']").attr("selected", true);
        $("#plus-btn").on("click", function() {
            var newId = "Q"+$("#q-select").val()+"."+$("#c-select").val();
//            console.log("/comp.html?q="+newId)
             location.href = "/comp.html?q="+newId;
        });
        $("#q-select,#c-select").on("change", function(){
            
            var newId = "Q"+$("#q-select").val()+"."+$("#c-select").val();
            var results = questions.filter(function (eachQ) { return newId === eachQ.id })[0];
            renderQuestionList(results,uniqueQues,uniqueCoun);
        });
        
        
        markContent();
        var options = {
            workerUrl: '/plugins/wordfreq/wordfreq.worker.js' };
        
        var wordfreq = WordFreq(options).process(JSON.stringify(qs), function (list) {
            if(WordCloud.isSupported){

                var wordFreqHtml = list.slice(0, Math.min(list.length, 15)).map(function(eachEle){
                    return { w: eachEle[0], n: eachEle[1]}
                });

                $("#question-view-container")
                  .empty()
                  .append(Mustache.to_html(wordcloudView, { wordFreqArr: wordFreqHtml}));

                var wordCtx = $('#wordCanvas')[0].getContext('2d');
                wordCtx.canvas.height = 450;
                wordCtx.canvas.width = parseInt(window.innerWidth);

                var weightFactorVal = 0.3;
                if(list.length>0) weightFactorVal = 100/list[0][1];

                WordCloud(document.getElementById('wordCanvas'), { 
                    list: list.slice(0, Math.min(list.length, 35)),
    //                drawOutOfBound: false,
                    shrinkToFit: true,
                    origin: [parseInt(wordCtx.canvas.width/2),parseInt(wordCtx.canvas.height/2)],
                    shape: "square",
                    color: "random-dark",
    //                backgroundColor: "rgba(52, 58, 64, 0.54)",
    //                minSize: 9
    //                gridSize : 10,
                    weightFactor: weightFactorVal,
                    maxRotation: 1,
                    minRotation: -1
                } );
                $("#wordFreqDiv .each-word").on("click",function(t){
                    $('#mark-form input[name="mark"]').val($(this).attr("data-word"));
                     markContent();
                });

            }
            else{
                console.log("WordCloud is Not Supported");
            }
        
        });
        
    };
    var markContent = function () {
      
        var context = document.querySelector("#question-view");
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
    
    var q = getUrlParameter('q');
    if(q==null) q="Q12.Taiwan";
    
    var m = getUrlParameter('m');
    if(m==null) m="";
    $('#mark-form input[name="mark"]').val(m);

    $('#mark-form').on("submit", function(e) {
          e.preventDefault();
          markContent();
    });
    
    
//    console.log(q,m);
    
    var results = questions.filter(function (eachQ) { return q === eachQ.id })[0];
    var uniqueQues = [...new Set(questions.map(item => item.qn))];
    var uniqueCoun = [...new Set(questions.map(item => item.country))];
//    console.log(results);
    renderQuestionList(results,uniqueQues,uniqueCoun);
});
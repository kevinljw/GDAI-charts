require.config({
    waitSeconds: 0
});
require([
  'dist/js/jquery.js',
  'dist/js/mustache.js',
  'dist/js/elasticlunr.js',
  'text!templates/question_view.mustache',
  'text!templates/question_list.mustache',
  'text!templates/wordcloud_view.mustache',
  'text!data6.json',
  'text!data6_index.json',
//  'text!example_data.json',
//  'text!example_index.json',
], function (_, Mustache, elasticlunr, questionView, questionList, wordcloudView, data, indexDump) {
    
  var renderQuestionList = function (qs, timeDiff) {
    $("#question-list-container")
      .empty()
      .append(Mustache.to_html(questionList, {questions: qs, num: qs.length, timeDiff: timeDiff}));
    // Create an options object for initialization
    var options = {
      workerUrl: '/plugins/wordfreq/wordfreq.worker.js' };
    // Initialize and run process() function
    var wordfreq = WordFreq(options).process(JSON.stringify(qs), function (list) {
      // console.log the list returned in this callback.
//      console.log(list);
        if(WordCloud.isSupported){
            
            var wordFreqHtml = list.slice(0, Math.min(list.length, 15)).map(function(eachEle){
                return { w: eachEle[0], n: eachEle[1]}
            });
            
            $("#question-view-container")
              .empty()
              .append(Mustache.to_html(wordcloudView, { wordFreqArr: wordFreqHtml}));
            
            var wordCtx = $('#wordCanvas')[0].getContext('2d');
            wordCtx.canvas.height = 350;
            wordCtx.canvas.width = parseInt(window.innerWidth/3);
            
            var weightFactorVal = 0.3;
            if(list.length>0) weightFactorVal = 100/list[0][1];
            
            WordCloud(document.getElementById('wordCanvas'), { 
                list: list.slice(0, Math.min(list.length, 35)),
//                drawOutOfBound: false,
                shrinkToFit: true,
                origin: [parseInt(wordCtx.canvas.width/2),parseInt(wordCtx.canvas.height/2)],
                shape: "circle",
                color: "random-dark",
//                backgroundColor: "rgba(52, 58, 64, 0.54)",
//                minSize: 9
//                gridSize : 10,
                weightFactor: weightFactorVal,
                maxRotation: 1,
                minRotation: -1
            } );
//            console.log(list[0][1]);
            $("#wordFreqDiv .each-word").on("click",function(t){
                  $('#search-form input').val($(this).attr("data-word"));
                  idxSearch();
            });
            
        }
        else{
            console.log("WordCloud is Not Supported");
        }
        
    });
  };
    
  

  var renderQuestionView = function (text2Show) {
    $("#question-view-container")
      .empty()
      .append(Mustache.to_html(questionView, text2Show));
      
    var context = document.querySelector("#question-view-pure");
    var instance = new Mark(context);
    var queryStr = $('input').val();
    instance.mark(queryStr);
    
   
    
  }

  window.profile = function (term) {
    console.profile('search')
    idx.search(term)
    console.profileEnd('search')
  }

  window.search = function (term) {
    console.time('search')
    idx.search(term)
    console.timeEnd('search')
  }

  var indexDump = JSON.parse(indexDump)
  console.time('load')
  window.idx = elasticlunr.Index.load(indexDump)
  console.timeEnd('load')

//  var questions = JSON.parse(data).questions.map(function (raw) {
//    return {
//      id: raw.question_id,
//      title: raw.title,
//      body: raw.body,
//      tags: raw.tags.join(' ')
//    }
//  });
//  console.log(JSON.parse(data));  
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

  

//  renderQuestionList(questions);
//  renderQuestionView(questions[0]);

//  $('a.all').bind('click', function () {
//    renderQuestionList(questions)
//    $('input').val('')
//  })
  

  var debounce = function (fn) {
    var timeout;
    return function () {
      var args = Array.prototype.slice.call(arguments),
          ctx = this

      clearTimeout(timeout)
      timeout = setTimeout(function () {
        fn.apply(ctx, args);
      }, 100)
    }
  }
  var idxSearch = function(){
      var query = $('#search-form input').val();
      var startTime, endTime;
      startTime = new Date();
      var results = idx.search(query).map(function (result) {
        return questions.filter(function (q) { return q.id === result.ref })[0]
      });
      endTime = new Date();
      var timeDiff = endTime - startTime; //in ms
      // strip the ms
      timeDiff /= 1000;

    //    console.log(json_config, query, results);
      renderQuestionList(results, timeDiff);
  };
  $('#search-form').on('keyup keypress', function(e) {
      var keyCode = e.keyCode || e.which;
      if (keyCode === 13) { 
        e.preventDefault();
        return false;
      }
  });
  $("#button-search").on("click touchstart",idxSearch);
    
  $('#search-form input').bind('keyup', debounce(function () {
    if ($(this).val() < 2) return;

    idxSearch();
  }));

  var subLength = 200;
  $("#question-list-container").delegate('tbody>tr', 'click touchstart', function () {
    var li = $(this)
    var id = li.data('question-id');
    var queryStr = $('input').val();

//    li.addClass("border-primary");
    
      
    var previewData = questions.filter(function (question) {
      return (question.id == id)
    })[0];
    
    var queryCol = ["comment", "c1", "c2", "c3", "c4"];
    var resultPre = "";
//    queryCol.forEach(function(eachCol){
//        
//        var tmpSplit = previewData[eachCol].split(queryStr);
//
//        if(tmpSplit.length>1){
//            console.log(tmpSplit);
//            for (var i = 1; i < tmpSplit.length; i++) {
//                resultPre+= tmpSplit[i-1].substr(-subLength,subLength)+'<mark>'+queryStr+'</mark>'+tmpSplit[i].substr(0,subLength)+"...<br>"
//            }
//        }
//    });
    queryCol.forEach(function(eachCol){
        var resultIdx = previewData[eachCol].search(new RegExp(queryStr.replace(" ","|"), "i"));
//        console.log(queryStr.replace(" ","|"),resultIdx);
        if(resultIdx>-1){
            if(eachCol === "comment"){
                resultPre += '<span class="badge badge-danger">Comments:</span><br>';
            }
            else{
                resultPre += '<span class="badge badge-success">Reviewers:</span><br>';
            }
            resultPre += "..."+previewData[eachCol].substr(Math.max(0,resultIdx-subLength), queryStr.length+2*subLength)+"...<br><br>";
        }
    });
    
    
    renderQuestionView({pureText: resultPre, m:queryStr, id: previewData.id, question: previewData.question, country:previewData.country});
  });
    
//  $("#question-list-container").delegate('tr', 'mouseout', function () {
//      var li = $(this)
//      li.removeClass("border-primary");
//  });
    
});
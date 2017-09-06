// Put all your page JS here

$(function () {
    $('#slickQuiz').slickQuiz();
    $('#continue').on('click', function(){
        var hundred = 100;
        var eighty = 80;
        var sixty = 60;
        var forty = 40;
        var twenty  = 20;
        var blank = 0;
        var score  = 0;
     var ans = $('#level').text().replace(/\D/g,'');
     switch (parseInt(ans)){
      case 1:
      score = hundred;
       localStorage.setItem('level','1.2');
      break;
      case 2:
      score = eighty;
       localStorage.setItem('level','1.2');
      break;
      case 3:
      score = sixty;
       localStorage.setItem('level','1.2');
      break;
      case 4:
      score = forty;
       localStorage.setItem('level','1.1');
      break;
      case 5:
      score = twenty;
       localStorage.setItem('level','1.1');
      break;
      case 6:
      score = blank;
       localStorage.setItem('level','1.1');
      break;
       default:
       score = blank;
     }
     
     var level = localStorage.getItem('level');
  $.ajax({
     type: 'POST',
     url: '/level1/quiz1',
     data: {score:score,level:level},
     success: function(res){
     if(res.score < 60){
        
      window.location.replace('/level1');
     }
    else{
       
        window.location.replace('/level1-section2');
    }
     }
  
    });


    });




});

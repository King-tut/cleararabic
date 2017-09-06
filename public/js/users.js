/*$(document).ready(function(){
        $('#regbtn').on('click', function(e){
          e.preventDefault();
           var name  = $('#name').val();
           console.log(name);
           var email  = $('#email').val();
           var password  = $('#password').val();
           var confirmpassword  = $('#confirm-password').val();

           
        
          $.ajax({
             type: 'POST',
             url: '/register',
             data: {name: name, email:email, password:password},
             success: function(res){
              if(!res){ console.log('There was no response from the server');}

               console.log('This is the data from the server ' + ' ' + res);
             },
            error: function(xhr){
                console.log(xhr.responseText);
            }

            });
        




        });
            
   
    });*/
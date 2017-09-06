class UserModel{
constructor(uname){
  this.uname = uname;
  
}

 setUserName(str){
      this.uname = str;
 }

 getUserName(){
     return this.setUserName("From the class menthod " + " " + this.uname);
 }




}


var him  = new UserModel('Billy');
him.setUserName('Harvey');



//module.exports= UserModel;
function redirect(){
  var user = firebase.auth().currentUser;
  var name, email, photoUrl, uid, emailVerified;
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      //get user info
      if (user != null) {
        name = user.displayName;
        email = user.email;
        photoUrl = user.photoURL;
        emailVerified = user.emailVerified;
        uid = user.uid;  // The user's ID, unique to the Firebase project. Do NOT use
                         // this value to authenticate with your backend server, if
                         // you have one. Use User.getToken() instead.

        //Stringify
        let dataString = JSON.stringify(user);

        //Save in storage
        localStorage.setItem("FIREBASE_USER", dataString);
      }

      //check user email and redirect
      if (email.includes("student") == true){
        window.location = "studentmainpage.html"
      }
      else if(email.includes("monash")== true && email.includes('student') == false){
        window.location = "lecturermainpage.html"
      }
      else{
        window.location = "studentmainpage.html"
      }

    } else {
      // No user is signed in.
    }
  });
}

redirect();

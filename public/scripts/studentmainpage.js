//Key to store student email when student is logged in
let STUDENT_EMAIL_KEY = "student_email"
let STUDENT_NAME_KEY = "student_name"

//Retrieve data from firebase database
var db = firebase.firestore();
var projectsRef = db.collection("projectLists").doc("projects");
projectsRef.get().then(function(doc){
  console.log("Called");
  const myData = doc.data();
  projects.fromData(myData);
  updateLocalStorage(PROJECT_LIST_KEY,projects);
  displayProjects();
}).catch(function(error){
  console.log("Error: ", error);
});

// Get user data
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    // Get user info
    if (user != null) {
      // get user name and email from firebase
      let email = user.email;
      let name = user.displayName;

      //Store student email and name in local storage
      updateLocalStorage(STUDENT_EMAIL_KEY, email);
      updateLocalStorage(STUDENT_NAME_KEY, name);
    }
  }
  else{
    // Remove when logged out
    localStorage.removeItem(STUDENT_EMAIL_KEY)
    localStorage.removeItem(STUDENT_NAME_KEY)
    window.location = "index.html";
  }
})


/**
* This function displays the projects the student is in by checking if the student
* email belongs to any team in project -> teams -> team members.
* @param None
* @return None
**/
function displayProjects(){
  // Output for project card
  let output = ``;
  let projectDisplayRef = document.getElementById("projectDisplay");

  if (getDataLocalStorage(STUDENT_NAME_KEY) != null){
      // Output div for  "Welcome, [student name]!"
      let studentNameRef = document.getElementById('student_id')

      //Output for "Welcome, [student name]!"
      let studentNameOutput = "Welcome, ";
      studentNameOutput += getDataLocalStorage(STUDENT_NAME_KEY) + "!"
      //Display on page for "Welcome, [student name]!"
      studentNameRef.innerHTML = studentNameOutput;
  }

    //Loop through projects
    for (let i = 0; i < projects._projects.length; i++){

      teams.fromData(projects._projects[i]);
      //teams
      for(let j = 0; j<teams.teams.length; j++){
        console.log(teams.teams)
        //team memebers
        for(let k=0; k<teams.teams[j].teammembers.length ;k++){
          console.log(teams.teams[j].teammembers.length)
          //get student email stored in local storage
          let email = getDataLocalStorage(STUDENT_EMAIL_KEY)
          // compare with team member's email to see if it exists
          // Display project card if the email exists
          if(teams.teams[j]._members[k]._email == email){
            let startYear=projects._projects[i].startDate.substr(0,4);
            let startMonth=projects._projects[i].startDate.substr(5, 2);
            let startDate=projects._projects[i].startDate.substr(8, 9);

            let dueYear=projects._projects[i].dueDate.substr(0,4);
            let dueMonth=projects._projects[i].dueDate.substr(5, 2);
            let dueDate=projects._projects[i].dueDate.substr(8, 9);

            output += `<div class="mdl-cell mdl-cell--4-col">`;
            output += `<div class="mdl-card mdl-shadow--2dp locker" style="background-color:#${projects._projects[i].color}">`;
            output += `<div class="mdl-card__title mdl-card--expand">`;
            output += `<h4 style = "font-weight: bold; font-family: monospace">${projects._projects[i].name}</h4></div>`;
            output += `<div class="mdl-card__title mdl-card--expand">`;
            output += '<h5>'+startDate+"/"+startMonth+"/"+startYear+"-"+dueDate+"/"+dueMonth+"/"+dueYear+'</h5></div>';
            output += `<div class="mdl-card__title mdl-card--expand" style = "font-family: monospace">`;
            output += `<div class="mdl-card__actions mdl-card--border">`;
            output += `<button class="mdl-button mdl-js-button mdl-js-ripple-effect" onclick="viewProject(${i})">Open Project</button>`;
            output += `</div></div></div></div>`;
            break;
          }
        }
    }
  }
    projectDisplayRef.innerHTML = output;
}

/**
This function leads the student to the team task tracker page of the team the student is in when the
student clicks on "Open project"
@param index this is the index of the team in the team list of this project
@return none
**/
function viewProject(index){
    //Update the project index in the local storage
    updateLocalStorage(PROJECT_INDEX,index);

    // Get student email from local storage
    let email = getDataLocalStorage(STUDENT_EMAIL_KEY)

    let chosenProject= projects.projects[index];

    //Restore teams of the chosenProject
    teams.fromData(chosenProject);

    //Loop through all the members of all teams and find in which team the student is
    for (let a=0; a<teams.teams.length; a++)
    {
      // Loop through members
      for (let b=0; b<teams.teams[a]._members.length; b++)
      {
        // Find email
        if (email==teams.teams[a]._members[b].email)
        {
          let teamIndex=a;
          //Set the team's index
          localStorage.setItem(TEAM_INDEX,teamIndex);
        }
      }
    }
    window.location = 'teamtasktracker.html';
}

displayProjects();

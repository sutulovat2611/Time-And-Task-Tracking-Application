"use strict"

/**
This function is responsible for displaying all available projects
@param none
@return none
**/
function displayProjects(){
    let projectDisplayRef = document.getElementById("projectDisplay");
    let output = ``;
    for (let i = 0; i < projects._projects.length;i++){
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
        output += `<h5>Number of Teams: ${projects._projects[i]._teams.length}</h5> </div>`;
        output += `<div class="mdl-card__actions mdl-card--border">`;
        output += `<button class="mdl-button mdl-js-button mdl-js-ripple-effect" onclick="viewProject(${i})">Open Project</button>`;
        output += `<button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" style=" position: relative; left: 40px;" onclick="deleteProject(${i})">`;
        output += `<i class="material-icons">delete</i></button>`;
        output += `<button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" style=" position: relative; left: 50px;" onclick="editProject(${i})">`;
        output += `<i class="material-icons">`;
        output += `perm_data_setting</i> </button> </div></div></div>`;
    }
    projectDisplayRef.innerHTML = output;
}
/**
This function is responsible of deleting a select project based on the index
@param index - index of the project
@return none
**/
function deleteProject(index){
    if(confirm("Delete this project?"))
    {
    projects._projects.splice(index,1);
    updateLocalStorage(PROJECT_LIST_KEY,projects);


    // Update firebase db
    projectsRef.set(JSON.parse(JSON.stringify(projects))).then(function(){
			console.log("Data saved!");
			location.reload();
		}).catch(function(error){
			console.log("Error: ", error);
		});
    }
}
/**
This function is responsible of editing a select project based on the index
@param index - index of the project
@return none
**/
function editProject(index){
    window.location = "editproject.html";
    updateLocalStorage(PROJECT_INDEX,index);
}
/**
This function is responsible of viewing a select project based on the index
@param index - index of the project
@return none
**/
function viewProject(index){
    //TODO: This is where the new html code goes i presume
    window.location = "listofteams.html";
    updateLocalStorage(PROJECT_INDEX,index);
}

let TEAM_LIST_KEY = "Team-List-Key";
localStorage.removeItem(TEAM_LIST_KEY);
localStorage.removeItem(PROJECT_INDEX);
localStorage.removeItem(TEAM_INDEX);
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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

  } else {
    // No user is signed in.
    //window.alert("No user is signed in");
    window.location = "index.html"
  }
});

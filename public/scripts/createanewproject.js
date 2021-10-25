"use strict"
//Global Variable
let members = [];

//Local storage keys
let TEAM_LIST_KEY = "Team-List-Key";
let MEMBERS_KEY = "Members-key";

//Code on load
//Load db from fireBase
var db = firebase.firestore();
var projectsRef = db.collection("projectLists").doc("projects");

// When logged out, user directed to log in page
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

  } else {
    // No user is signed in.
    window.location = "index.html"
  }
});

/**
This function is called when the user confirms the new project, it gets all the input values and save them as attributes of a new project.
@param none
@return none
**/
function createProject()
{
  //Get user input values
	let projectName = document.getElementById("projectName").value;
	let projectRemarks = document.getElementById("remarks").value;
	let startDate = document.getElementById("startDate").value;
	let dueDate = document.getElementById("dueDate").value;
	let color = document.getElementById("projectColor").value;
	let project = getDataLocalStorage(PROJECT_LIST_KEY)
	let allProjectName = [];
	let checkProjectExist = false;

	//Retrieve all project name
	for (let i = 0 ;i < project._projects.length; i++)
	{
		allProjectName.push(project._projects[i]._name);
	}

	let startDateObj=new Date(startDate);
	let dueDateObj=new Date(dueDate);
	let dateNow = new Date();

	//Check if all the necessary input is there
	if (projectName==""||startDate==""||dueDate=="")
	{
		alert("Ensure Name and Date Fields are filled out!")
	}
	else if (checkProjectExist == true)
	{
		alert("Project already exists!");
	}
	else{
		//Checking if dates are proper
		if (startDateObj>dueDateObj)
		{
		  alert("The due date must be after the start date")
		}
		else{
		//Checks if you're from clicking the view button
		if (!checkIfDataExistsLocalStorage(PROJECT_INDEX))
			projects.addProject(projectName,  projectRemarks, startDate, dueDate, color, teams._teams);
		else{
			let index = getDataLocalStorage(PROJECT_INDEX);
			projects._projects[index].name = projectName;
			projects._projects[index].remarks = projectRemarks;
			projects._projects[index].startDate = startDate;
			projects._projects[index].dueDate = dueDate;
			projects._projects[index].color = color;
			//Unsure of this below one
			projects._projects[index]._teams = teams._teams;
		}
		//Update local storage
		updateLocalStorage(PROJECT_LIST_KEY,projects);
		projectsRef.set(JSON.parse(JSON.stringify(projects))).then(function(){
			console.log("Data saved!");
			localStorage.removeItem(TEAM_LIST_KEY);
			localStorage.removeItem(MEMBERS_KEY);
			localStorage.removeItem(PROJECT_INDEX);
			window.location = 'lecturermainpage.html';
		}).catch(function(error){
			console.log("Error: ", error);
		});
	}
}
}

/**
This function is called when the user confirms the new team, it gets all the input values and save them as attributes of a new team.
@param none
@return none
**/
function confirmNewTeam() {
	let dialog = document.querySelector('#projectCreationDialog');
	//getting team name and remarks
	let teamName = document.getElementById("teamName").value;
	let teamRemarks = document.getElementById("teamRemarks").value;
	if (teamName == "")
	{
		alert("Please fill in the team name.");
		return null;
	}
	for (let i = 0; i < teams._teams.length; i++){
		if (teamName == teams._teams[i].teamName){
			console.log(teams._teams[i].teamName)
			console.log(teamName)
			alert("Team Name in use select another name!");
			return null;
		}
	}
	//adds a created team to the list of teams
	teams.addTeam(teamName, teamRemarks, members);
	//Update local storage
	updateLocalStorage(TEAM_LIST_KEY,teams);
	updateLocalStorage(MEMBERS_KEY,members);
	//Show the added team on the table of teams
	teamTable();
	//empty members list
	document.getElementById("teamName").value = "";
	document.getElementById("teamRemarks").value = "";
	document.getElementById("tableForTeamMembersContent").innerHTML = `<td class="mdl-data-table__cell--non-numeric">No members added</td>`;
	dialog.close();
	members = [];

}

/**
This function is called when the user presses a button to add a new team member, asking the user for a proper email address and updating the table of currently added students respectively
@param none
@return none
**/
function addTeamMember() {
	//asking a user for an email address
	let teamEmail = prompt("Enter a valid email");
	let is_found=false;
	for (let i=0; i< teams._teams.length; i++)
	{
		for (let a=0; a<teams._teams[i]._members.length; a++)
		{
		    if (teamEmail==teams._teams[i]._members[a]._email)
            {
              is_found=true;
            }
		}
	}

  if(members != []){
    for (let k = 0; k < members.length; k++)
    {
      if (teamEmail == members[k]._email)
      {
        alert("Student already exist in this team.");
        return null;
      }
    }
  }


	if (is_found==false)
	{
		if(teamEmail.includes("@student.monash.edu"))
		{
		//Adding a student to a member list
		let student = new Student(teamEmail);
		members.push(student);
		//adding a new student email to a table
		let table = document.getElementById('tableForTeamMembersContent');
		let output = "";
		for (let i = 0; i < members.length; i++) {
			output += '<tr id="row' + (i + 1) + '">';
			output += '<td class="mdl-data-table__cell--non-numeric">' + members[i].email + '</td>';
			output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + i+ ')>';
			output += '<i class="material-icons">delete</i></button> </td></tr>';
		}
		table.innerHTML = output;
		}
		else
		{
			alert("This is not valid monash email. Try again")
		}
	}
	else
	{
		alert("This student is added to another team")
	}
}

/**
This function is called when the user presses a delete button on a certain row of a member table. This allows to remove the student email from the student list and update the table respectively.
@param index, index of the student in student list
@return none
**/
function deleteMember(index) {
	//removes the chosen student from the member list
	members.splice(index, 1);
	//updating the table
	let table = document.getElementById('tableForTeamMembersContent');
	let output = "";

	//in case there are no added students in member list
	if (members.length == 0) {
		output = '<tr id="row0"><td class="mdl-data-table__cell--non-numeric"> No members added</td><td></td></tr>';
	}
	else {
		for (let i = 0; i < members.length; i++) {
			output += '<tr id="row' + (i + 1) + '">';
			output += '<td class="mdl-data-table__cell--non-numeric">' + members[i].email + '</td>';
			output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + i + ')>';
			output += '<i class="material-icons">delete</i></button> </td></tr>';
		}
	}
	table.innerHTML = output;
}

/**
This function is needed to update the team table based on the new added by the user teams
@param none
@return none
**/
function teamTable() {

	let table = document.getElementById("tableForTeamsContent");
	let output = "";
	if (teams._teams.length==0)
	{
		output += '<tr id=row0><td class="mdl-data-table__cell--non-numeric">No teams are added</td>';
  	output += '<td></td><td></td></tr>';
	}
	else {
		for (let i = 0; i < teams._teams.length; i++) {
			output += '<tr><td>' + teams._teams[i].teamName +':</td>';
			output += '<td class="mdl-data-table__cell--non-numeric">' + teams._teams[i].teammembers.length + '</td>';
	    output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteTeam('+ i +')>';
			output += '<i class="material-icons">delete</i></button> </td> </tr>';
		}
	}
		table.innerHTML = output;
}


/**
This function is called when the user presses a delete button on a certain row of a teams table. This allows to remove the team from the team list and update the table respectively.
@param index, index of the student in student list
@return none
**/
function deleteTeam(index) {
	//removes the team from the team list, each team has its unique name
	teams._teams.splice(index,1);
	//This if statement only runs if clicked on edit from the hompepage
	if (checkIfDataExistsLocalStorage(PROJECT_INDEX)){
		index = getDataLocalStorage(PROJECT_INDEX);
		projects.projects[index]._teams = teams;
		updateLocalStorage(PROJECT_LIST_KEY,projects);
	}
	// Update local storage
	updateLocalStorage(TEAM_LIST_KEY,teams);
	teamTable();
}

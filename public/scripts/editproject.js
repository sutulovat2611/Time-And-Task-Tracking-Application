"use strict"

/**
This function is called when the user confirms the new project, it gets all the input values and save them as attributes of a new project.
@param none
@return none
**/
function createProject()
{
	let projectName = document.getElementById("projectName").value;
	let projectRemarks = document.getElementById("remarks").value;
	let startDate = document.getElementById("startDate").value;
	let dueDate = document.getElementById("dueDate").value;
	let color = document.getElementById("projectColor").value;
	let project = getDataLocalStorage(PROJECT_LIST_KEY);
	let allProjectName = [];
	let checkProjectExist = false;
  let index = getDataLocalStorage(PROJECT_INDEX);

	//Retrieve all project name
	for (let i = 0 ;i < project._projects.length; i++)
	{
		allProjectName.push(project._projects[i]._name);
	}

	//check if project already exist.
  for (let j = 0 ; j < allProjectName.length; j++)
  {
    if (j == index)
    {
      continue;
    }
    else if (projectName == allProjectName[j])
    {
      checkProjectExist = true;
    }
  }

	let startDateObj = new Date(startDate);
	let dueDateObj = new Date(dueDate);
	let dateNow = new Date();
	//checks if all the necessary input is there
	if (projectName==""||startDate==""||dueDate=="")
	{
		alert("Ensure Name and Date Fields are filled out!")
	}
	else if (checkProjectExist == true)
	{
		alert("Project already exists!");
	}
	else if (startDateObj > dueDateObj)
	{
		alert("The due date must be after the start date.")
	}
	else
	{
			let index = getDataLocalStorage(PROJECT_INDEX);
			projects._projects[index].name = projectName;
			projects._projects[index].remarks = projectRemarks;
			projects._projects[index].startDate = startDate;
			projects._projects[index].dueDate = dueDate;
			projects._projects[index].color = color;
			//Unsure of this below one
			projects._projects[index]._teams = teams._teams;
		//}
		//Update local storage
		updateLocalStorage(PROJECT_LIST_KEY,projects);
		projectsRef.set(JSON.parse(JSON.stringify(projects))).then(function(){
			//console.log("Data saved!");
			localStorage.removeItem(TEAM_LIST_KEY);
			localStorage.removeItem(MEMBERS_KEY);
			localStorage.removeItem(PROJECT_INDEX);
			window.location = 'lecturermainpage.html';
		}).catch(function(error){
			console.log("Error: ", error);
		});
	}

}


/**
This function is called when the user confirms the new team, it gets all the input values and save them as attributes of a new team.
@param none
@return none
**/
function confirmNewTeam()
{
	let teamIndexExist = checkIfDataExistsLocalStorage(TEAM_INDEX);
	let projectIndex = getDataLocalStorage(PROJECT_INDEX);

	//When user choose to edit, teamIndexExist = the team already exists
	if (teamIndexExist)
	{
		//Get projects and team index from local storage
		let allProject = getDataLocalStorage(PROJECT_LIST_KEY);
		let teamIndex = getDataLocalStorage(TEAM_INDEX);
		let allTeamName = [];

		//Retrieve all team name in this project
		for (let i = 0; i < allProject._projects[projectIndex]._teams.length; i++)
		{
			allTeamName.push(allProject._projects[projectIndex]._teams[i]._teamName)
		}

		//Get value of teamName
		let teamName = document.getElementById("teamName").value;
		//If teamName is empty
		if (teamName == "")
		{
			alert("Please fill in the team name.");
			return null;
		}

		//Loop through all team names to check if the team name is same with others
		for (let j = 0; j < allTeamName.length; j++)
		{
			if (j == teamIndex)
			{
				continue;
			}
			// If the name is same as another team name, alert the user and return null
			else if (teamName == allTeamName[j])
			{
				alert("Team Name in use select another name!");
				return null;
			}
		}

		//If not repeat, update the team name
		projects._projects[projectIndex]._teams[teamIndex]._teamName = teamName;
		teams._teams[teamIndex]._teamName = teamName;
		//Update local storage
		updateLocalStorage(PROJECT_LIST_KEY,projects);
		updateLocalStorage(TEAM_LIST_KEY,teams);
		teamTable();

		//Remove team index from local storage
		localStorage.removeItem(TEAM_INDEX);
	}
	//When user choose to add a new team
	else
	{
		// Get user inputs
		let teamName = document.getElementById("teamName").value;
		let teamRemarks = document.getElementById("teamRemarks").value;

		//If user input for team name is empty, alert the user and
		if (teamName == "")
		{
			alert("Please fill in the team name.");
			return null;
		}

		//Loop through all team names to check if there are any same team names
		for (let i = 0; i < teams._teams.length; i++)
		{
			if (teamName == teams._teams[i].teamName)
			{
				alert("Team Name in use select another name!");
				return null;
			}
		}

	//Getting team name and remarks
	//Adds a created team to the list of teams
	teams.addTeam(teamName, teamRemarks, members);
	projects.projects[projectIndex]._teams = teams._teams;

	//Update local storage
	updateLocalStorage(PROJECT_LIST_KEY,projects);
	updateLocalStorage(MEMBERS_KEY,members);

	//Show the added team on the table of teams
	teamTable();
	}

	//empty members list
	document.getElementById("teamName").value = "";
	document.getElementById("teamRemarks").value = "";
	document.getElementById("tableForTeamMembersContent").innerHTML = `<td class="mdl-data-table__cell--non-numeric">No members added</td> <td> </td>`;
	dialog.close();
	members = [];
}

/**
This function is called when the user presses a button to add a new team member,
asking the user for a proper email address and updating the table of currently
added students respectively
@param none
@return none
**/
function addTeamMember() {
	//Asking a user for an email address
	let teamEmail = prompt("Enter a valid email");

	//Check if the team already exists
	let teamIndexExist = checkIfDataExistsLocalStorage(TEAM_INDEX);
	let teamIndex = getDataLocalStorage(TEAM_INDEX);

	//Initialise
	let table = document.getElementById('tableForTeamMembersContent');
	let output = "";
	let is_found = false;

	//Check if the team member already exists in another team -> set isFound to true
	for (let i=0; i< teams._teams.length; i++)
	{
		for (let a=0; a<teams._teams[i]._members.length; a++)
		{
		    if (teamEmail==teams._teams[i]._members[a]._email)
        {
            is_found = true;
        }
		}
	}

	// When editing a team (team index exists), use teams._teams[teamIndex]._members
	//to check if the student already exists in the team
	if (teamIndexExist && teams._teams[teamIndex]._members != [])
	{
		for (let k = 0; k < teams._teams[teamIndex]._members.length; k++)
		{
			if (teamEmail == teams._teams[teamIndex]._members[k]._email)
			{
				alert("Student already exist in this team.");
				return null;
			}
		}
	}
	//If add new team (team does not already exist), use global var "members" to check email
	else if(!teamIndexExist && members!= []){

		for (let k = 0; k < members.length; k++)
		{
			// Check if the same student already exists in the student list of team
			if (teamEmail == members[k]._email)
			{
				//Alert user
				alert("Student already exist in this team.");
				return null;
			}
		}
	}


	if (is_found == false)
	{
		if(teamEmail.includes("@student.monash.edu"))
		{
			if (teamIndexExist)
			{
				let projectIndex = getDataLocalStorage(PROJECT_INDEX);
				let student = new Student(teamEmail);
				teams._teams[teamIndex]._members.push(student)
				// updateLocalStorage(TEAM_LIST_KEY,teams);
				// projects._projects[projectIndex]._teams[teamIndex]._members.push(student);
				updateLocalStorage(PROJECT_LIST_KEY,projects);

				//Display student table in dialog
				for (let k = 0; k < teams._teams[teamIndex]._members.length; k++)
				{
					output += '<tr id="row' + (k + 1) + '">';
					output += '<td class="mdl-data-table__cell--non-numeric">' + teams._teams[teamIndex]._members[k]._email + '</td>';
					output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + k+ ')>';
					output += '<i class="material-icons">delete</i></button> </td></tr>';
				}

			}
			else
			{
				//adding a student to a member list
				let student = new Student(teamEmail);
				members.push(student);
				//adding a new student email to a table
				for (let i = 0; i < members.length; i++) {
					output += '<tr id="row' + (i + 1) + '">';
					output += '<td class="mdl-data-table__cell--non-numeric">' + members[i].email + '</td>';
					output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + i+ ')>';
					output += '<i class="material-icons">delete</i></button> </td></tr>';
				}
			}

			table.innerHTML = output;
		}

		else
		{
			alert("This is not valid student monash email. Try again!");
		}
	}
	else
	{
		alert("This student is added to another team!");
	}
}

/**
This function is called when the user presses a delete button on a certain row of a member table. This allows to remove the student email from the student list and update the table respectively.
@param index, index of the student in student list
@return none
**/
function deleteMember(index)
{
	console.log("Called1")
	let teamIndexExist = checkIfDataExistsLocalStorage(TEAM_INDEX);
	let teamIndex = getDataLocalStorage(TEAM_INDEX);
	let projectIndex = getDataLocalStorage(PROJECT_INDEX);
	let projects = getDataLocalStorage(PROJECT_LIST_KEY);

	if (teamIndexExist)
	{
		console.log("Called2")
		//delete

		teams._teams[teamIndex]._members.splice(index,1);
		updateLocalStorage(PROJECT_LIST_KEY,projects);
	}
	else
	{
			members.splice(index,1);
	}

	//updating the table
	let table = document.getElementById('tableForTeamMembersContent');
	let output = "";
	let memberEmail = [];
	let allEmails = [];

	//console.log(teams._teams[teamIndex]._members)
	if (teamIndexExist)
	{
		for (let j = 0; j < teams._teams[teamIndex]._members.length; j++)
		{
			allEmails.push(teams._teams[teamIndex]._members[j]._email);
		}
		//console.log(allEmails)
		//in case there are no added students in member list
		if (allEmails.length == 0)
		{
			output = '<tr id="row0"><td class="mdl-data-table__cell--non-numeric"> No members added</td><td></td></tr>';
		}
		else
		{
			for (let i = 0; i < allEmails.length; i++)
			{
				output += '<tr id="row' + (i + 1) + '">';
				output += '<td class="mdl-data-table__cell--non-numeric">' + allEmails[i] + '</td>';
				output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + i + ')>';
				output += '<i class="material-icons">delete</i></button> </td></tr>';
			}
		}
	}
	else
	{
			if (members.length == 0)
			{
				output = '<tr id="row0"><td class="mdl-data-table__cell--non-numeric"> No members added</td><td></td></tr>';
			}
			else
			{
				for (let i = 0; i < members.length; i++)
				{
					output += '<tr id="row' + (i + 1) + '">';
					output += '<td class="mdl-data-table__cell--non-numeric">' + members[i]._email + '</td>';
					output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + i + ')>';
					output += '<i class="material-icons">delete</i></button> </td></tr>';
				}
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
		// var row = document.getElementById("row0");
		// row.parentNode.removeChild(row);
	}
	else {
		//console.log(teams._teams[0].members);
		for (let i = 0; i < teams._teams.length; i++) {
			output += '<tr><td>' + teams._teams[i].teamName +':</td>';
			output += '<td class="mdl-data-table__cell--non-numeric">' + teams._teams[i].teammembers.length + '</td>';
			output += `<td><button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" id="teamEditButton${i}"  style=" position: relative; center: 50px;" onclick="editTeam(${i})">`;
			output += `<i class="material-icons">`;
			output += `perm_data_setting</i> </button> </td></div></div></div>`;
	    output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteTeam('+ i +')>';
			output += '<i class="material-icons">delete</i></button> </td> </tr>';
		}
	}
		table.innerHTML = output;
}

function editTeam(index)
{
	updateLocalStorage(TEAM_INDEX,index);

	let allTeamName = [];
	let projectIndex = getDataLocalStorage(PROJECT_INDEX);
	let teamIndex = getDataLocalStorage(TEAM_INDEX);
	let projects = getDataLocalStorage(PROJECT_LIST_KEY);

	//display dialog
	var dialog = document.querySelector('#projectCreationDialog');
	var showModalButton = document.querySelector('#teamEditButton' + index);
	if (! dialog.showModal) {
			dialogPolyfill.registerDialog(dialog);
		}

		dialog.showModal();

		dialog.querySelector('.close').addEventListener('click', function() {
			//Close dialog
			dialog.close();
			localStorage.removeItem(TEAM_INDEX);
			//empty members list
			document.getElementById("teamName").value = "";
			document.getElementById("teamRemarks").value = "";
			document.getElementById("tableForTeamMembersContent").innerHTML = `<td class="mdl-data-table__cell--non-numeric">No members added</td> <td> </td>`;
			members = [];
			// document.getElementById('tableForTeamMembersContent').innerHTML = "";
		});

		//retrieve all team name in this project
		for (let i = 0; i < projects._projects[projectIndex]._teams.length; i++)
		{
			allTeamName.push(projects._projects[projectIndex]._teams[i]._teamName)
		}
		document.getElementById("teamName").value = allTeamName[teamIndex];

		//display the existing students
		let table = document.getElementById('tableForTeamMembersContent');
		let output = "";
		if(teams._teams[teamIndex]._members.length > 0){
			for (let i = 0; i <teams._teams[teamIndex]._members.length; i++)
			{
				output += '<tr id="row' + (i + 1) + '">';
				output += '<td class="mdl-data-table__cell--non-numeric">' + teams._teams[teamIndex]._members[i]._email + '</td>';
				output += '<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick=deleteMember(' + i+ ')>';
				output += '<i class="material-icons">delete</i></button> </td></tr>';
			}
		table.innerHTML = output;
	}else{
		output += '<td class="mdl-data-table__cell--non-numeric">No members added</td> <td> </td>';
	}
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
		projects.projects[index]._teams = teams._teams;
		updateLocalStorage(PROJECT_LIST_KEY,projects);
	}
	// Update local storage
	//updateLocalStorage(TEAM_LIST_KEY,teams);
	teamTable();
}

//code on load
//Load db from fireBase
var db = firebase.firestore();
var projectsRef = db.collection("projectLists").doc("projects");

//Global Variables
let members = [];

//Local storage keys
let TEAM_LIST_KEY = "Team-List-Key";
let MEMBERS_KEY = "Members-key";

//Retrieve data from local storage if it exists
if (checkIfDataExistsLocalStorage(MEMBERS_KEY)){
	teamTable();
}
if (checkIfDataExistsLocalStorage(PROJECT_INDEX)){
	//Get index of the project that was clicked on from homepage
	let index = getDataLocalStorage(PROJECT_INDEX);
	//Set the values to the ones that is retrieved from local storage
	let projectNameRef = document.getElementById("projectName");
	let projectRemarksRef = document.getElementById("remarks");
	let startDateRef = document.getElementById("startDate");
	let dueDateRef = document.getElementById("dueDate");
	let colorRef = document.getElementById("projectColor");
	// Load the values into their designated spaces
	projectNameRef.value = projects.projects[index]._name;
	projectRemarksRef.value = projects.projects[index]._remarks;
	startDateRef.value = projects.projects[index]._startDate;
	dueDateRef.value = projects.projects[index]._dueDate;
	colorRef.value = projects.projects[index]._color;
	let projectTeam = projects.projects[index];
	teams.fromData(projectTeam);

	// Display the teams on table after retrieved from local storage
	teamTable();
}

if (checkIfDataExistsLocalStorage(TEAM_LIST_KEY)){
  	let retrievedData=getDataLocalStorage(TEAM_LIST_KEY);
  	teams.fromData(retrievedData);
		teamTable();
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

  } else {
    // No user is signed in.
    window.location = "index.html"
  }
});


/**
This function is needed to update the team table based on the new added by the user teams
@param none
@return none
**/
function projectTeamTable()
{
  let table = document.getElementById("tableForTeamsInProjectContent");
  let output = "";
  if (teams._teams.length == 0) {
		output = '<tr id="row0"><td class="mdl-data-table__cell--non-numeric"> No teams added</td><td></td><td></td></tr>';
	}
	for (let i = 0; i < teams._teams.length; i++) {
		output += '<tr href="lecturermainpage.html"><td style="text-align: center">' + teams._teams[i].teamName +':</td>';
    output += '<td style="text-align: center">'+teams._teams[i].teammembers.length+'</td>';
	output += `<td> <button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-color--amber-400" onclick=openProject(${i})>Open</button></td></tr>`;
	}
	table.innerHTML = output;
}


function openProject(teamIndex)
{
	  localStorage.setItem(TEAM_INDEX,teamIndex);
  	window.location = 'teamtasktracker.html';
}

if (checkIfDataExistsLocalStorage(PROJECT_INDEX)){
	//Get index of the project that was clicked on from homepage
	let index = getDataLocalStorage(PROJECT_INDEX);
	// Load the values into their designated spaces
	let projectNameRef = document.getElementById("nameOfTheProject");
	projectNameRef.innerHTML = projects.projects[index]._name;
	let projectTeam = projects.projects[index];
	teams.fromData(projectTeam);
	// Display the teams on table after retrieved from local storage
	projectTeamTable();
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

  } else {
    // No user is signed in.
    //window.alert("No user is signed in");
    window.location = "index.html"
  }
});

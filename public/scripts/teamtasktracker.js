
"use strict"
var dialog2 = document.querySelector('#newTaskDialog');
//On click add a task to master list, dialog is prompted in HTML
dialog2.querySelector('.confirm').addEventListener("click", addNewTask);

let checkTasksAvailable = false;
let projectIndex = 0;
let teamIndex = 0;
let tasks = new TaskList();
let name = "";
let email = "";

//Load db from fireBase
var db = firebase.firestore();
var projectsRef = db.collection("projectLists").doc("projects");

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {

  } else {
    // No user is signed in.
    //window.alert("No user is signed in");
    window.location = "index.html"
  }
});


//Key to store student email when student is logged in
let STUDENT_EMAIL_KEY = "student_email"

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    //get user info
    if (user != null) {
      // get user name and email from firebase
      name = user.displayName;
      email = user.email;
      //Store student email in local storage
      updateLocalStorage(STUDENT_EMAIL_KEY, email);
    }
  }
})


function onloadRun(){
  onload();
  displayCompletedOrUncompleted();
  displayUncompletedTaskDropdown();
  displayStudentTable();
}

function onload()
{
  console.log("Onload")
  if (checkIfDataExistsLocalStorage(PROJECT_INDEX)){
	//Get index of the project that was clicked on from homepage
  projectIndex = getDataLocalStorage(PROJECT_INDEX);
  //We will use teamIndex to retrieve the specific team data
  teamIndex = getDataLocalStorage(TEAM_INDEX);
	// Load the values into their designated spaces
  let projectNameRef = document.getElementById("nameOfTheProject");
  projectNameRef.innerHTML = projects._projects[projectIndex]._name;

	let chosenProject= projects.projects[projectIndex];
  teams.fromData(chosenProject);
  document.getElementById("teamName").innerHTML="Team:"+teams._teams[teamIndex]._teamName;

  updateLocalStorage(STUDENT_TASK_KEY, teams._teams[teamIndex]._members);

  //If exist
  if (checkIfDataExistsLocalStorage(TASK_DATA_KEY))
  {
    //get data from storage
    let dataObj = getDataLocalStorage(TASK_DATA_KEY);
    //restore data
    tasks.fromData(dataObj);
  }

  displayStudentCards(teams._teams[teamIndex]._members);
  }
}

function onloadRun(){
  onload();
  displayCompletedOrUncompleted();
  displayUncompletedTaskDropdown();
  displayStudentTable(teams._teams[teamIndex]._members);
  displayComment(true);
}

function onload()
{
  localStorage.removeItem(TASK_DATA_KEY)
  localStorage.removeItem(STUDENT_TASK_KEY)
  if (checkIfDataExistsLocalStorage(PROJECT_INDEX)){
	//Get index of the project that was clicked on from homepage
  projectIndex = getDataLocalStorage(PROJECT_INDEX);
  //We will use teamIndex to retrieve the specific team data
  teamIndex = getDataLocalStorage(TEAM_INDEX);
	// Load the values into their designated spaces
  let projectNameRef = document.getElementById("nameOfTheProject");
  projectNameRef.innerHTML = projects._projects[projectIndex]._name;

	let chosenProject= projects.projects[projectIndex];
  teams.fromData(chosenProject);

  document.getElementById("teamName").innerHTML="Team:"+teams._teams[teamIndex]._teamName;


  // for (let i=0; i<teams._teams[teamIndex]._members.length; i++)
  // {
  //   console.log(teams._teams[teamIndex]._members[i])
  //   // let teamMember=new Student(teams._teams[teamIndex]._members[i]);
  //   // teams._teams[teamIndex]._members.push(teamMember);
  // }
  //updateLocalStorage(STUDENT_TASK_KEY, teams._teams[teamIndex]._members);

  //get tasks
  tasks = teams._teams[teamIndex].taskList;

  if (checkIfDataExistsLocalStorage(STUDENT_TASK_KEY))
  {
    //get data from storage
    let dataObj = getDataLocalStorage(STUDENT_TASK_KEY);
    //restore data
    for(let i = 0; i<teams._teams[teamIndex]._members.length; i++){
      teams._teams[teamIndex]._members[i].fromData(dataObj[i]);
    }

  }
  displayStudentCards(teams._teams[teamIndex]._members);

}
}


/**
This function adds a new task to the master task list when the add new task button is clicked.
After adding the new task, the dialog will close. If task already exists, an error message will be prompted
and it cannot be added.
@param None
@return None
**/
function addNewTask()
{
  //Dialog
  let dialog2 = document.querySelector('#newTaskDialog');

  //Get user input from popup
  let task = (dialog2.querySelector('#newTaskInput').value).toString();

  //If user input is not empty, then add task.
  if (task != "")
  {
    //Add task to global task list using class method
    tasks.addTask(task.toString());
    dialog2.close();
    tasks._tasks[tasks.tasks.length-1]._taskNumber = tasks.tasks.length;

    //Update local storage & reload
    projects.projects[projectIndex]._teams = teams._teams;
    updateLocalStorage(PROJECT_LIST_KEY, projects)
  	location.reload();

  }
  //If it is empty, prompt error message
  else
  {
    alert("You are not allowed to enter empty input. Please check and try again later.");
  }
}

/**
This function allows the student to delete the task in the master list.
@param taskIndex, index of the task in the list.
@return none
**/
function displayTaskSetting(taskIndex){
  //get the dialog that is mapped to the task
  let taskDialog = document.querySelector('.dialog--' + taskIndex);
  let dialogEvent = function() {
    //remove from student array
    //loop through student's task lists and see if task exists in their task list
    for(let i = 0; i < teams._teams[teamIndex]._members.length; i++){
      for(let j = 0; j<teams._teams[teamIndex]._members[i].tasksInList.length; j++){

        //if exists, remove from student's task list
        if(teams._teams[teamIndex]._members[i].tasksInList[j].title == tasks.tasks[taskIndex].title){
          deleteTaskForStudent(i,j);
        }
      }
    }

    //Use class method to remove task
    tasks.removeTask(taskIndex);

    //update task number
    for (let j = 0; j < tasks.tasks.length; j++)
    {
      tasks._tasks[j]._taskNumber = j+1;
    }

    //Update the local storage
    projects.projects[projectIndex]._teams = teams._teams;
    updateLocalStorage(PROJECT_LIST_KEY, projects);

  	location.reload();
  };
    taskDialog.showModal();
    taskDialog.querySelector('.close').addEventListener('click', function() {
    taskDialog.querySelector(`#deleteTask${taskIndex}`).removeEventListener(`click`,dialogEvent);
    taskDialog.close();
  });
  taskDialog.querySelector(`#deleteTask${taskIndex}`).addEventListener('click', dialogEvent);

}

/**
This fucntion displays all the tasks in the master list.
@param data, data is an object that contains the array of tasks
@return none
**/
function displayAllTasks()
{
  //Get table using ID from HTML
  let table=document.getElementById('tableContent');
  let output2 = "";

  //Display no tasks available when there are no tasks
  if (tasks._tasks.length < 0 && checkTasksAvailable == false )
  {
    checkTasksAvailable = true;
    output2 += "--No tasks available--";
    document.getElementById("noTaskAvailable").innerHTML = output2;
  }

  //Loop through tasks array
  for (let i=0; i<tasks.tasks.length; i++)
  {
    let table_len=(table.rows.length);
    //Table display in output
    let output="";
    output+='<tr id=row'+i+'>';
    output+='<td class="mdl-data-table__cell--non-numeric">'+(i+1)+'</td>';
    output+='<td>'+tasks.tasks[i]._title+'</td>';
    output+=`<td>`+ tasks.tasks[i].contribution + `</td>`;
    output+= `<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" id="settings` + i + `" onclick=displayTaskSetting(${i})>`;
    output+= '<i class="material-icons">delete</i></button> </td> </tr>';
    output += `<dialog class="mdl-dialog dialog--`+ i + `">`;
    output += `<div class="mdl-dialog__content"> <p>Delete this task?</p> </div>`;
    output += `<div class="mdl-dialog__actions">`;
    output += `<button type="button" class="mdl-button" id="deleteTask${i}" >Delete</button>`;
    output += `<button type="button" class="mdl-button close">Cancel</button> </div> </dialog>`;
    let row = table.insertRow(table_len).outerHTML=output;
  }
}

/**
This fucntion displays all the tasks in the master list based on the filter. If the dropdown value(filter)
is completed, all completed tasks are shown. If the dropdown value is uncompleted, all tasks that are not completed
are shown. A task is determined to be completed if the contribution has reached 100%, else it is considered to be uncompleted.
@param none
@return none
**/
function displayCompletedOrUncompleted()
{
  //Initialise
  let table=document.getElementById('tableContent');
  let completedOrNot = document.getElementById("completedOrNot").value;
  let length=table.rows.length;

  for(let i=0; i<length; i++ )
  {
    table.deleteRow(0);
  }

  //When dropdown value is 'completed'
  if (completedOrNot=="completed")
  {
    for (let i=0; i<tasks.tasks.length; i++)
    {
      let output="";
      let table_len=(table.rows.length);
      //check if contribution is 100
      if (tasks.tasks[i].contribution==100)
      {
        let table_len=(table.rows.length);
        let output="";
        output+='<tr id=row'+i+'>';
        output+='<td class="mdl-data-table__cell--non-numeric">'+(i+1)+'</td>';
        output+='<td>'+ tasks.tasks[i]._title+'</td>';
        output+=`<td>`+ tasks.tasks[i]._contribution + `</td>`;
        output+= `<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" id="settings` + i + `" onclick=displayTaskSetting(${i})>`;
        output+= '<i class="material-icons">delete</i></button> </td> </tr>';
        output += `<dialog class="mdl-dialog dialog--`+ i + `">`;
        output += `<div class="mdl-dialog__content"> <p>Delete this task?</p> </div>`;
        output += `<div class="mdl-dialog__actions">`;
        output += `<button type="button" class="mdl-button" id="deleteTask${i}" >Delete</button>`;
        output += `<button type="button" class="mdl-button close">Cancel</button> </div> </dialog>`;
        let row = table.insertRow(table_len).outerHTML=output;
      }
     }
  }
  //when dropdown value is 'uncompleted'
  else if (completedOrNot=="uncompleted")
  {
    for (let i=0; i<tasks.tasks.length; i++)
    {
      let output="";
      let table_len=(table.rows.length);
      //check if contribution is 100
      if (tasks.tasks[i].contribution!=100)
      {
        //Table display output
        let table_len=(table.rows.length);
        let output="";
        output+='<tr id=row'+i+'>';
        output+='<td class="mdl-data-table__cell--non-numeric">'+(i+1)+'</td>';
        output+='<td>'+ tasks.tasks[i]._title+'</td>';
        output+=`<td>`+ tasks.tasks[i].contribution + `</td>`;
        output+= `<td> <button class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" id="settings` + i + `" onclick=displayTaskSetting(${i})>`;
        output+= '<i class="material-icons">delete</i></button> </td> </tr>';
        output += `<dialog class="mdl-dialog dialog--`+ i + `">`;
        output += `<div class="mdl-dialog__content"> <p>Delete this task?</p> </div>`;
        output += `<div class="mdl-dialog__actions">`;
        output += `<button type="button" class="mdl-button" id="deleteTask${i}" >Delete</button>`;
        output += `<button type="button" class="mdl-button close">Cancel</button> </div> </dialog>`;
        let row = table.insertRow(table_len).outerHTML=output;
      }
     }
  }
  //When the dropdown value is 'all'
  else
  {
    displayAllTasks(tasks);
  }
}

/**
This function displays all the student cards that are in a team onto the HTML page.
@param teams._teams[teamIndex]._members, an array that contains one or more student objects
@return none
**/
function displayStudentCards(studentArray){

  //Initialise
  let output = "";
  let studentCardsOutput = document.getElementById("studentCards");
  let dialog = [];

  //Loop through array that contains the students in the team
  for(let a=0; a <studentArray.length; a++){
    //Student card display output
    output += '<div class="mdl-grid">';
    output += '<div class="demo-card-wide mdl-card mdl-shadow--2dp" style="width:95%; overflow:auto; min-width: 300px;">';
    output += '<div class="mdl-card__title">';
    //output += '<h2 class="mdl-card__title-text">' + teams._teams[teamIndex]._members[a].givenName + " " + teams._teams[teamIndex]._members[a].familyName + '</h2>';
    output += '<h2 class="mdl-card__title-text">' + studentArray[a]._email + '</h2>';
    output += '</div>';
    output += '<div class="mdl-card__supporting-text" style="overflow-x:auto;">';
    output += '<div class="mdl-grid">';
    output += '<div class="mdl-cell mdl-cell--6-col">';
    output += '<div class="mdl-selectfield mdl-js-selectfield mdl-selectfield--floating-label" >';
    output += '<select class="mdl-textfield__input" id="uncompletedTasks'+ a +'"name="uncompletedTasks' + a+ '">';
    output += '</select></div></div>';
    output += '<div class="mdl-cell mdl-cell--6-col">';
    output += '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" onclick = "addTask(' + a +')">';
    output += 'Add task';
    output += '</button>';
    output += '</div>';
    output += '</div>';
    output += '<table class="mdl-data-table mdl-js-data-table" style = "width:100%;font-size: 18px">';
    output += '<thead>';
    output += '<tr>';
    output += '<th class="mdl-data-table__cell--non-numeric" style = "font-size: 10px;">Tasks</th>';
    output += '<th style = "font-size: 10px">Contribution(%)</th>';
    output += '<th style = "font-size: 10px">Expected Contribution(%)</th>';
    output += '<th style = "font-size: 10px">Time(Hours)</th>';
    output += '<th style = "font-size: 10px">Edit</th>';
    output += '<th style = "font-size: 10px">Delete</th></tr>';
    output += '</thead>';
    output += '<tbody id = "table'+ a + '">';
    output += '</tbody> </table> </div>';
    output += '<div class="mdl-card__menu">';
    output += '<div class="mdl-grid">';
    // output += '<div class="mdl-cell mdl-cell--6-col">';
    // output += '<div class="mdl-selectfield mdl-js-selectfield mdl-selectfield--floating-label" >';
    // output += '<select class="mdl-textfield__input" id="uncompletedTasks'+ a +'"name="uncompletedTasks' + a+ '">';
    // output += '</select></div></div>';
    // output += '<div class="mdl-cell mdl-cell--6-col">';
    // output += '<button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect" onclick = "addTask(' + a +')">';
    // output += 'Add task';
    // output += '</button>';
    output += '</div>';
    output += '</div></div>';
    output += "</div>"
    output += "<br>"
    output += "<br>"
    output += "</div>";

}
  //Put in HTML
  studentCardsOutput.innerHTML = output;
}



/**
This function displays the uncompleted tasks for each students in their card dropdown list.
@param None
@return none
**/
function displayUncompletedTaskDropdown(){
  //Initliase
  let output = "";
  let dropdownList = [];

  //Loop through student array and store the identification of the dropdownlist in an array
  for(let a=0; a <teams._teams[teamIndex]._members.length; a++){
    dropdownList[a] = document.getElementById("uncompletedTasks" + a);
  }

  //Loop through the tasks
  for (let i = 0; i<tasks.tasks.length; i++){
    // If the contribution of the task is not 100
    if (tasks.tasks[i]._contribution != 100){
      //Output for dropdown
      output += "<option value="+ tasks.tasks[i].title + ">";
      output += tasks.tasks[i].title;
      output += "</option>"
    };
  };
  //Output in all the dropdown list
  for (let j =0 ; j<dropdownList.length; j++){
    console.log("1")
    dropdownList[j].innerHTML = output;
  };
}

/**
This function adds a task to the student table. If the task is already in the table, prompt a message.
Else, add to the table.
@param index, index of dropdown list
@return none
**/
function addTask(index){
  //Initialise
  let taskExists = false;
  let dropdownListInput = document.getElementById("uncompletedTasks" + index);
  let dropdownValue = dropdownListInput.options[dropdownListInput.selectedIndex].text;

  //Loop through student tasks and see if it already exists
  for (let i = 0; i < teams._teams[teamIndex]._members[index].tasksInList.length; i++){
      if(teams._teams[teamIndex]._members[index].tasksInList[i].title == dropdownValue){

        //If it exists, taskExists = true
        taskExists = true;
        //break
        break;
      }
      else{
        //else, taskExists = false
        taskExists = false;
      }
  }

  //If task does not exists in student's list, add task fro student
  if (taskExists == false){
    teams._teams[teamIndex]._members[index].addTaskForStudent(dropdownValue);
    console.log(teams._teams[teamIndex]._members[index])
    projects.projects[projectIndex]._teams = teams._teams;
    updateLocalStorage(PROJECT_LIST_KEY, projects);
  }
  //If it alreaady exists, alert
  else{
    alert("Task already in table!");
  }

  displayStudentTable(teams._teams[teamIndex]._members);
}

/**
This function displays the student table task list.
@param None
@return none
**/
function displayStudentTable(){

  let tableInput = [];
  let output = [];
  let dialog = [];
  let outputDialogStudent = [];
  let outputDivision = "";
  let dialogOutput = "";

  //Loop through student array
  for(let i = 0; i<teams._teams[teamIndex]._members.length; i++){
    //Get table id
    tableInput[i] = document.getElementById("table" + i);

    //Initialise
    let output2 = "";
    let output_dialog = [];
    //console.log(typeof(teams._teams[teamIndex]._members[i]))
    console.log(teams._teams[teamIndex]._members[i])
    console.log(teams)
    if (teams._teams[teamIndex]._members[i].tasksInList.length>0){

      //Loop through task array of teams._teams[teamIndex]._members[i]
      for(let j=0; j<teams._teams[teamIndex]._members[i].tasksInList.length; j++){

        let output3 ='';
        console.log(teams._teams[teamIndex]._members[i].tasksInList[j].expectedContribution)

        //Table display
        output2 += '<tr>';
        output2 += '<td class="mdl-data-table__cell--non-numeric">' + teams._teams[teamIndex]._members[i].tasksInList[j].title + '</td>';
        output2 += '<td>' + teams._teams[teamIndex]._members[i].tasksInList[j].contribution + '</td>';
        output2 += '<td>' + teams._teams[teamIndex]._members[i].tasksInList[j].expectedContribution + '</td>';
        output2 += '<td>' + teams._teams[teamIndex]._members[i].tasksInList[j].timeTaken + '</td>';
        output2 += '<td>';
        output2 += '<button type="button" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect show-dialog-student' + i + '-task'+ j + '" id ="show-dialog-student' + i +'-task' + j + '">';
        output2 += '<i class="material-icons">edit</i>';
        output2 += '</button></td>';
        output2 += '<td>';
        output2 += `<button type="button" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect" onclick = "deleteTaskForStudent(${i}, ${j})">`;
        output2 += '<i class="material-icons">delete</i>';
        output2 += '</button>';
        output2 += '</td></tr>';

        //output for dialog fo each task, each must have individual id
        dialogOutput += '<dialog class="mdl-dialog dialog" id = "dialog-'+ i + '-' + j + '">';
        dialogOutput += '<div class="mdl-dialog__content">';
        dialogOutput += '<form action="#">';
        dialogOutput += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
        dialogOutput += '<input class="mdl-textfield__input" type="text" id="contributionInput-' + i + '-' + j + '">';
        dialogOutput += '<label class="mdl-textfield__label" for="sample3">Enter contribution</label>';
        dialogOutput += '</div>';
        dialogOutput += '</form>';
        dialogOutput += '<form action="#">';
        dialogOutput += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
        dialogOutput += '<input class="mdl-textfield__input" type="text" id="expectedContributionInput-' + i + '-' + j + '">';
        dialogOutput += '<label class="mdl-textfield__label" for="sample3">Enter expected contribution</label>';
        dialogOutput += '</div>';
        dialogOutput += '</form>';
        dialogOutput += '<form action="#">';
        dialogOutput += '<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">';
        dialogOutput += '<input class="mdl-textfield__input" type="text" id="timeInput-' + i + '-' + j + '">';
        dialogOutput += '<label class="mdl-textfield__label" for="sample3">Enter time</label>';
        dialogOutput += '</div>';
        dialogOutput += '</form>';
        dialogOutput += '</div>';
        dialogOutput += '<div class="mdl-dialog__actions mdl-dialog__actions--full-width">';
        dialogOutput += '<button type="button" class="mdl-button" onmousedown = confirmButtonChosen('  + i + "," + j + ') >Confirm</button>';
        dialogOutput += '<button type="button" class="mdl-button close">Cancel</button>';
        dialogOutput += '</div>';
        dialogOutput += '</dialog>';

        output[i] = output2;

      }

    }

  }
  document.getElementById("dialogOutput").innerHTML = dialogOutput;

  //If undefined or no task, don't display
  for(let i = 0; i<teams._teams[teamIndex]._members.length; i++){
    if (output[i] != undefined){
      tableInput[i].innerHTML = output[i];
    }
  }

  /*
  The purpose of categoring these dialogs is to ensure that the dialogs can be easily differentiated as they cannot share the same dialog
  variable. Each dialog must have its own variable. There will be two arrays:
  The studentDialog array stores all the tasks dialogs for each student while the studentDialogTasks stores the dislog for EACH task.
  */
  let studentDialog = []; //array for each student

  for(let a=0; a <teams._teams[teamIndex]._members.length; a++){ //table number (in sequence)

    let studentDialogTasks = []; //array for the tasks for each student

    for(let i=0; i<teams._teams[teamIndex]._members[a].tasksInList.length; i++){ //task number in the table

      //push each dialog into student dialog tasks
      studentDialogTasks.push(document.querySelector('#dialog-'+ a + '-' + i));
      let id = '#show-dialog-student' + a + '-task' + i;
      let showModalButton3 = document.querySelector(id);
      if (! studentDialogTasks[i].showModal) {
        dialogPolyfill.registerDialog(studentDialogTasks[i]);
      }
      showModalButton3.addEventListener('click', function() {
        studentDialogTasks[i].showModal();
      });
      studentDialogTasks[i].querySelector('.close').addEventListener('click', function() {
        studentDialogTasks[i].close();
      });

    }
    // at the end of each outer loop, put all the task dialogs for one student into the array
    studentDialog[a] = studentDialogTasks;
  }

}

/**
This function delete the task for the student table.
@param studentIndex, index of student inside the student array to identify which table to add
@param taskIndex, index of the task in the student's task list
@return none
**/
function deleteTaskForStudent(studentIndex, taskIndex){
  //Prompt confirm message
  if(confirm("Are you sure you want to delete this task for this student?"))
  { //use class method to remove task
    removeContribution(studentIndex, taskIndex);
    teams._teams[teamIndex]._members[studentIndex].tasksDone.removeTask(taskIndex);
    location.reload();

    //remove their contribution on the task
    projects.projects[projectIndex]._teams = teams._teams;
    //teams._teams[teamIndex].taskList._tasks = tasks;
    //update storage
    updateLocalStorage(PROJECT_LIST_KEY, projects)
  }
}

/**
This function registers the contribution and time input in the student's task list
when it is edited and updates the student list table. Besides, it also updates the % done for
each task in the master task list.
@param i, student index value in the global student array variable
@param j, task index value in the student's task list
@return none
**/
function confirmButtonChosen(i,j)
{

  //get the id
  let contributionInputID = "contributionInput-" + i + "-" + j;
  let timeInputID = "timeInput-" + i + "-" + j;
  let expectedContributionInputID = "expectedContributionInput-" + i + "-" + j;
  //get the value
  let contributionInput = Number(document.getElementById(contributionInputID).value);
  let timeInput = Number(document.getElementById(timeInputID).value);
  let expectedContributionInput = Number(document.getElementById(expectedContributionInputID).value);
  console.log(expectedContributionInput);
  //prompt alerts if the inputs are invalid
  if (isNaN(timeInput) || isNaN(contributionInput)|| isNaN(expectedContributionInput))
  {
    alert("Invalid input. Please check and try again later.");
  }
  else if( contributionInput == "" || timeInput == "" || expectedContributionInput == "")
  {
    alert("Some neccessary input is missing. Please check and try again")
  }
  else if (contributionInput > 100 || contributionInput < 0)
  {
    alert("Contribution must not smaller than 0 and greater than 100.");
  }
  else if(expectedContributionInput > 100 || expectedContributionInput < 0){
    alert("Contribution must not smaller than 0 and greater than 100.");
  }
  else if (timeInput < 0)
  {
    alert("Time input must not be a negative number.");
  }
  else
  {
    //if valid, update the contribution of the task
    updateContribution(i,j)
  }
}

function updateContribution(i,j){

  //get id
  let contributionInputID = "contributionInput-" + i + "-" + j;
  let timeInputID = "timeInput-" + i + "-" + j;
  let expectedContributionInputID = "expectedContributionInput-" + i + "-" + j;

  //get input
  let contributionInput = Number(document.getElementById(contributionInputID).value);
  let timeInput = Number(document.getElementById(timeInputID).value);
  let expectedContributionInput = Number(document.getElementById(expectedContributionInputID).value);
  let data = teams._teams[teamIndex]._members;

  // Update Global tasks variable
  //loop throught tasks and see which one has the same name
  for (let k = 0;k < tasks.tasks.length; k++){
    if (tasks.tasks[k].title == data[i]._tasksDone._tasks[j]._title){
      console.log("a")
      // Subtract old value as well
      //Check if the contribution updated is more than the currrent contribution value
      if(contributionInput > data[i]._tasksDone._tasks[j]._contribution){
          // if the total contribution for the specific task is less than 100, then update
          if(tasks.tasks[k].contribution + contributionInput - data[i]._tasksDone._tasks[j]._contribution <= 100){
            tasks.tasks[k].contribution += contributionInput - data[i]._tasksDone._tasks[j]._contribution;
            tasks.tasks[k].timeTaken += timeInput - data[i]._tasksDone._tasks[j]._timeTaken;
          }
          else{
            //alert if contribution> 100
            alert("Contribution for a task cannot be greater than 100%!");
            break;
          }
      }
      else{
          //Check if the contribution updated is less than the currrent contribution value
          if(tasks.tasks[k].contribution + contributionInput - data[i]._tasksDone._tasks[j]._contribution <= 100){
            // if the total contribution for the specific task is less than 100, then update
            tasks.tasks[k].contribution -=  data[i]._tasksDone._tasks[j]._contribution - contributionInput;
            tasks.tasks[k].timeTaken -= data[i]._tasksDone._tasks[j]._timeTaken - timeInput;
          }

        else{
          //alert
            alert("Contribution for a task cannot be greater than 100%!");
            break;
        }
      }

      if(expectedContributionInput > data[i]._tasksDone._tasks[j]._expectedContribution){
            // if the total contribution for the specific task is less than 100, then update
            if(tasks.tasks[k].expectedContribution + expectedContributionInput - data[i]._tasksDone._tasks[j]._expectedContribution <= 100){
              tasks.tasks[k].expectedContribution += expectedContributionInput - data[i]._tasksDone._tasks[j]._expectedContribution;
            }
            else{
              //alert if contribution> 100
              alert("Expected contribution for a task cannot be greater than 100%!");
              break;
            }
        }
        else{
          //Check if the contribution updated is less than the currrent contribution value
          if(tasks.tasks[k].expectedContribution + expectedContributionInput - data[i]._tasksDone._tasks[j]._expectedContribution <= 100){
            // if the total contribution for the specific task is less than 100, then update
            tasks.tasks[k].expectedContribution -=  data[i]._tasksDone._tasks[j]._expectedContribution - expectedContributionInput;
          }
          else{
            //alert
              alert("Expected contribution for a task cannot be greater than 100%!");
              break;
          }
        }
        //update local storage
        //set values
        data[i]._tasksDone._tasks[j]._contribution = contributionInput;
        data[i]._tasksDone._tasks[j]._timeTaken = timeInput;
        data[i]._tasksDone._tasks[j]._expectedContribution = expectedContributionInput;
        projects.projects[projectIndex]._teams = teams._teams;
        updateLocalStorage(PROJECT_LIST_KEY, projects);
        displayStudentTable();
        location.reload();
        break;
      }
    }
  }

/**
This function removes the contribution of a student done to a task when a task
is removed from a student's task list.
@param i, student index in the student array global variable
@param j, task index value in the task list of the student
@return none
**/
function removeContribution(i,j){
  //retrieve data from local storage
  let data = teams._teams[teamIndex]._members;

  // Update Global tasks variable
  //loop throught tasks and see which one has the same name
  for (let k = 0;k < tasks.tasks.length; k++){
    if (tasks.tasks[k].title == data[i]._tasksDone._tasks[j]._title){
      tasks.tasks[k].contribution -=  data[i]._tasksDone._tasks[j]._contribution;
      tasks.tasks[k].timeTaken -= data[i]._tasksDone._tasks[j]._timeTaken;
      tasks.tasks[k].expectedContribution -= data[i]._tasksDone._tasks[j]._expectedContribution;

      //update
      projects.projects[projectIndex]._teams = teams._teams;
      updateLocalStorage(PROJECT_LIST_KEY, projects);
      break;
    }
  }
}

function displayComment(flag){
  let thisUser = firebase.auth().currentUser;
  let name = "";
  let email = "";

  if (thisUser != null){
    name = thisUser.displayName;
    email = thisUser.email;
  }
  else {
    name = "Anonymous";
    email = "";
  }
  if (!flag){
    let comment = document.getElementById("comment").value;
    if (comment == ""){
      alert("Comment cannot be empty!");
    }
    else{
      let commentObject = {
        author: name,
        comment: comment,
        email: email
      };

      teams.fromData(projects.projects[projectIndex]);
      console.log(teams._teams[teamIndex])
      teams._teams[teamIndex]._comments.push(commentObject);
      updateLocalStorage(PROJECT_LIST_KEY, projects);
      teams.fromData(projects.projects[projectIndex])
    }
  }

  let output = ""
  for (let i = 0; i < projects.projects[projectIndex]._teams[teamIndex]._comments.length; i++){
    output += '<i class="material-icons" style="vertical-align: middle">person</i>';
    output += `<strong>${projects.projects[projectIndex]._teams[teamIndex]._comments[i].author+":" }</strong>`;
    output += `<class="comment__text">${projects.projects[projectIndex]._teams[teamIndex]._comments[i].comment}`;
    output += '<button class="mdl-button mdl-js-button mdl-js-ripple-effect mdl-button--icon mdl-color--amber-400"  style= "position: relative; left: 7px"';
    output +=  `data-upgraded=",MaterialButton,MaterialRipple" onclick="deleteComment(${i})">`;
    output +=  '<i class="material-icons" role="presentation"> delete_outline </i>';
    output +=  '<span class="mdl-button__ripple-container"><span class="mdl-ripple"></span></span></button>';
    output += '</nav></br>';
  }
  let commentSection = document.getElementById("commentSection");
  commentSection.innerHTML = output;
  let textValue = document.getElementById("comment");
  textValue.value = "";
}

function deleteComment(index){
  projects.projects[projectIndex]._teams[teamIndex]._comments.splice(index,1);
  updateLocalStorage(PROJECT_LIST_KEY, projects);
  displayComment(true);
}


function saveChanges()
{
  console.log(email);
  if (email.includes("monash")== true && email.includes('student') == false){
    projectsRef.set(JSON.parse(JSON.stringify(projects))).then(function(){
      console.log("Data saved!");
      window.location = 'listofteams.html'
    }).catch(function(error){
      console.log("Error: ", error);
    });
  }
  else{
    projectsRef.set(JSON.parse(JSON.stringify(projects))).then(function(){
      console.log("Data saved!");
      window.location = "studentmainpage.html";
    }).catch(function(error){
      console.log("Error: ", error);
    });
  }

  localStorage.removeItem(TEAM_INDEX);
}

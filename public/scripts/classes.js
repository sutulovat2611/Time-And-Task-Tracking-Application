"use strict"
// get current user
var user = firebase.auth().currentUser;
const TASK_INDEX_KEY = "taskIndex";
const TASK_DATA_KEY = "taskData";
const STUDENT_TASK_KEY = "studentTasksData";
const PROJECT_LIST_KEY = "Project-List-Key";
const PROJECT_INDEX = "Project-Index";
const TEAM_INDEX = "Team-Index";

//PROJECT class
class Project{

  /**
  Constructor
  @param name name of the project
  @param remarks remarks for the project
  @param startDate start date of the project
  @param dueDate due date of the project
  @param color the color of the project card
  @param teams the teams in the project
  **/
  constructor(name, remarks, startDate, dueDate, color, teams)
  {
    this._name=name;
    this._remarks=remarks;
    this._startDate=startDate;
    this._dueDate=dueDate;
    this._color=color;
    this._teams=teams; // an array
  }

  //Getters
  get name(){return this._name;}
  get remarks(){return this._remarks; }
  get startDate(){return this._startDate; }
  get dueDate(){return this._dueDate; }
  get color(){return this._color; }
  get teams(){return this._teams;}

  //Setters
  set name(newName){this._name=newName;}
  set remarks(newRemarks){this._remarks=newRemarks; }
  set startDate(newStartDate){this._startDate=newStartDate; }
  set color(newColor){this._color=newColor; }
  set dueDate(newDueDate){this._dueDate=newDueDate;}

  //From data method to restore data
  fromData(dataObject)
  {
    this._name=dataObject._name;
    this._remarks=dataObject._remarks;
    this._startDate=dataObject._startDate;
    this._dueDate= dataObject._dueDate;
    this._color=dataObject._color;
    this._teams=dataObject._teams;
  }
}

/**
Project list class to store the list of projects
**/
class ProjectList{
  /**
  Constructor
  @param none
  @return none
  **/
  constructor()
  {
    this._projects=[];
  }

  //Getters
  get projects(){return this._projects; }
  get count() {return this._projects.length;}

  /**
  Add project method
  @param name name of the project
  @param remarks remarks for the project
  @param startDate start date of the project
  @param dueDate due date of the project
  @param color the color of the project card
  @param teams the teams in the project
  **/
  addProject(name, remarks, startDate, dueDate, color, teams)
  {
    let project=new Project(name, remarks, startDate, dueDate, color, teams);
    this._projects.push(project);
  }

  /**
  This method gets the specific project
  @param index the index of the project in the lust
  @return the project of the index
  **/
  getProject(index)
  {
    return this._projects[index];
  }

  // From data method ro restore data
  fromData(dataObject)
  {
    let data=dataObject._projects;
    this._projects=[];

    for (let i=0; i<data.length;i++)
    {
      let project=new Project();
      project.fromData(data[i]);
      this._projects.push(project);
    }
  }
}

/**
Team class to store data of a team
**/
class Team{
  /**
  Constructor
  @param name name of the team
  @param remarks remarks of the team
  @param members the members of the team
  */
  constructor(name, remarks, members)
  {
    this._teamName=name;
    this._teamRemarks=remarks;
    this._members=members; // array of student objects instnaces
    this._taskList = new TaskList()
    this._comments = [];
  }

  //Getters
  get teamName(){return this._teamName;}
  get teamRemarks(){return this._teamRemarks; }
  get teammembers(){return this._members; }
  get taskList() {return this._taskList;}
  get comments() {return this._comments;}

  //Setters
  set teamName(newTeamName){this._teamName=newTeamName; }
  set teamRemarks(newTeamRemarks){this._teamRemarks=newTeamRemarks; }
  set taskList(newTaskList) {this._taskList._tasks = newTaskList}
  set comments(newComments) {this._comments = newComments;}

  //from data method to restore data
  fromData(dataObject)
  {
    this._teamName=dataObject._teamName;
    this._teamRemarks=dataObject._teamRemarks;
    // this._members=dataObject._members;
    this._taskList.fromData(dataObject._taskList)
    this._comments = dataObject._comments;

    let data=dataObject._members;
    this._members=[];
    for (let i=0; i<data.length;i++)
    {
      let student=new Student();
      student.fromData(data[i]);
      this._members.push(student);
    }

  }
}

/*
Team list class store store a list of teams
*/
class TeamList{
  /**
  Constructor
  @param none
  @return none
  */
  constructor()
  {
    this._teams=[];
  }

  //Getters
  get teams(){return this._teams; }
  get count() {return this._teams.length;}

  //Setter
  set teams(newTeams) {this._teams = newTeams;}

  /**
  Add team method to add a team to the list
  @param name name of the team
  @param remarks remarks of the team
  @param members the members of the team
  */
  addTeam(name,remarks,members)
  {
    let team=new Team(name,remarks,members);
    this._teams.push(team);
  }

  /**
  Get team method to get specific team from the team List
  @param index index of the teams
  @return the team of the index
  **/
  getTeam(index)
  {
    return this._teams[index];
  }

  // from data method to restore data
  fromData(dataObject)
  {
    let data=dataObject._teams;
    this._teams=[];

    for (let i=0; i<data.length;i++)
    {
      let team=new Team();
      team.fromData(data[i]);
      this._teams.push(team);
    }
  }
}

/**
TASK class to represent a task
**/
class Task
{
  constructor(title)
  {
    this.taskNumber = 0;
    this.title = title;
    this.contribution = 0;
    this.timeTaken = 0;
    this._expectedContribution = 0;
  }

  //accessors
  //get studentName() {return this._studentName;}
  //get studentID() {return this._studentID;}
  get taskNumber() {return this._taskNumber;}
  get title() {return this._title;}
  get contribution() {return this._contribution;}
  get timeTaken() {return this._timeTaken;}
  get expectedContribution(){return this._expectedContribution;}

  //seters
  //set studentName(newStudentName) {this._studentName = newStudentName;}
  //set studentID(newStudentID) {this._studentID = newStudentID;}
  set taskNumber(newTaskNumber) {this._taskNumber = newTaskNumber;}
  set title(newTitle) {this._title = newTitle;}
  set contribution (newContribution) {this._contribution = newContribution;}
  set timeTaken (newTimeTaken) {this._timeTaken = newTimeTaken;}
  set expectedContribution (newExpectedContribution) {this._expectedContribution = newExpectedContribution;}

  //methods
  fromData(data)
  {
    this._studentName = data._studentName;
    this._studentID = data._studentID;
    this._taskNumber = data._taskNumber;
    this._title = data._title;
    this._contribution = data._contribution;
    this._expectedContribution = data._expectedContribution;
    this._timeTaken = data._timeTaken;
  }
}

/**
Task list class to store a list of tasks
**/
class TaskList{
  /**
  Constructor
  @param none
  @return none
  **/
  constructor(){
    this._tasks = [];
    this._taskLength = 0;
  }

  //getters
  get tasks(){return this._tasks;}
  get taskLength(){return this._tasks.length}

  /**
  Add task method to add a task to the list
  @param taskName the name of the task
  @return none
  **/
  addTask(taskName){
    // To check of the task already exists
    let taskExists = false;
    //Loop through tasks
    for(let i = 0; i<this._tasks.length; i++){
      // If task exists, sets the taskExists to true and break
      if (this._tasks[i].title == taskName){
        taskExists = true;
        break;
      }
    }
    //Only allows the new task to be added if it doesn't already exists
    if (taskExists == false){
      //Create new task
      let task = new Task(taskName);
      //Push to list
      this._tasks.push(task);
    }
    else{
      alert("Task already exists!");
    }
  }

  /**
  Remove task method to remove the task from the list
  @param taskIndex index of the task in the task list
  @return none
  **/
  removeTask(taskIndex){
    this._tasks.splice(taskIndex,1);
  }

  //From data method to restore data
  fromData(data)
  {
    let data1= data._tasks;

    this._tasks = [];

    for(let i = 0; i < data1.length; i++)
    {
      let task = new Task();
      // the data for this point is data1[i]
      task.fromData(data1[i]);
      // using array push method to add to array
      this._tasks.push(task);
    }

  }

}

/**
This function checks if there is any data in the local storage using the key
@param key the key that stores the data
@return boolean true if exists, false if no
**/
function checkIfDataExistsLocalStorage(key)
{
  //get data from storage
  let data = localStorage.getItem(key);

  //if not undefined, not null and empty
  if (!data||data != undefined)
  {
    for (let prop in data)
    if (!data[prop]||data[prop] != undefined)
    {
      //return trew
      return true;
    }

    else
    {
      //else, return false
      return false;
    }
  }
  else
  {
    return false;
  }
}

/**
Update local storage method
@param key the key to store the data to
@param data the data to store to the key
@return none
**/
function updateLocalStorage(key, data)
{
  //Stringify
  let dataString = JSON.stringify(data);

  //Save in storage
  localStorage.setItem(key, dataString);
}

/**
Get data from local storage method
@param key the key to store the data to
@return the data
**/
function getDataLocalStorage(key)
{
  //get data from storage
  let data = localStorage.getItem(key);

  //return to obj
  let dataObj = JSON.parse(data);

  return dataObj;
}

//Log out function
function logOut(){
  firebase.auth().signOut();
}


/* Person Class Definition
----------------------------
Attributes:
- email: String - acts as identifier as well
- givenName: String
- familyName: String

Methods:
+ getters, setters for all attributes
+ fromData(data): void - retrieve data from localStorage
*/
class Person{
  /**
  Constructor
  @param email the email of the person
  **/
  constructor(email){
    this._email = email;
    this._givenName = "";
    this._familyName = "";
  }

  //+ getters, setters for all attributes
  get email(){return this._email;}
  get givenName(){return this._givenName;}
  get familyName(){return this._familyName;}

  // + fromData(data): void - retrieve data from localStorage
  fromData(data){
    this._email = data._email;
    this._givenName = data._givenName;
    this._familyName = data._familyName;
  }
}

/*Lecturer Class attributes
----------------------------
Attributes:
- inherits from Person
- add role = lecturer

Methods:
+ getter, setter for Person
+ fromData(data): void - retrieve data from localStorage
*/
class Lecturer extends Person{
  /**
  Constructor
  @param email the email of the person
  **/
  constructor(email){
    super(email);
    this.studentPriviledge = true;
    this.lecturerPriviledge = true;
  }

  //+ fromData(data): void - retrieve data from localStorage
  fromData(data){
    super.fromData(data);
    this._studentPriviledge = true;
    this._lecturerPriviledge = true;
  }
}

/* Student Class Definition
--------------------------------
Attributes:
- inherits from Person
- add role = lecturer

Methods:
+ getter, setter for Person
+ fromData(data): void - retrieve data from localStorage
*/

class Student extends Person{
  /**
  Constructor
  @param email the email of the person
  **/
  constructor(email){
    super(email);
    this._studentPriviledge = true;
    this._lecturerPriviledge = false;
    this._tasksDone = new TaskList();
  }

// getters
  get tasksDone(){return this._tasksDone;}

  get tasksInList(){
    return this._tasksDone.tasks;
  }

  /**
  Add task for a student method
  @param taskName the name of the task
  @return none
  **/
  addTaskForStudent(taskName){
    this._tasksDone.addTask(taskName);
  }

  /**
  Remove task for student method
  @param index the index of the task to be removed
  **/
  removeTaskForStudent(index){
    this._tasksDone.splice(index, 1);
  }

  //+ fromData(data): void - retrieve data from localStorage
  fromData(data){
    super.fromData(data);
    this._studentPriviledge = true;
    this._lecturerPriviledge = false;
    this._tasksDone.fromData(data._tasksDone)
  }
}

// Global team list
let teams = new TeamList();
let projects= new ProjectList();

//To check if data exists
if (checkIfDataExistsLocalStorage(PROJECT_LIST_KEY))
{
  let retrievedData = getDataLocalStorage(PROJECT_LIST_KEY);
  projects.fromData(retrievedData);
}

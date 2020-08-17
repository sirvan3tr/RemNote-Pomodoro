/*
Author: Sirvan Almasi
Imperial College London
git: https://github.com/sirvan3tr/RemNote-Pomodoro
Date created: 14 Aug 2020
Version: 1.0.0
*/

// global variables
let t = 25, // time limit is 25min
  pomConsole = document.getElementById("pomodoro_console"),
  logName = "Pomodoro 10,000hr log",
  locStorage = window.localStorage,
  toLog = true,
  locStorageTag = "remnote_pomodoro_tag";


/*
Parameters:
logName (default=Pomodoro 10,000hr log)
t (default=25min)
toLog (whether to create a page to log the hours) (true or false)
*/
let urlParams = new URLSearchParams(window.location.search);
if(urlParams.has("t")) {
  try {
    let tempT = parseInt(urlParams.get("t"));
    t = tempT;
  } catch(e) {
    console.log("error" + e);
  }
}
if(urlParams.has("logName")) logName = urlParams.get("logName");
if(urlParams.has("log")) {
  let tempToLog = urlParams.get("log");
  if (tempToLog === "true" || tempToLog == "false") toLog = urlParams.get("log");
}


class Pomodoro {
  constructor(tLimit, dispDiv, logName, pomConsole, toLog) {
    this.tLimit = tLimit;
    this.dispDiv = dispDiv;
    this.locStorage = window.localStorage;
    this.locKey = "remonote_pomodoro2";
    this.interval = 0;
    this.logName = logName;
    this.pomConsole = pomConsole;
    this.logBool = false;
    
    // Create a log file
    if(toLog==="true" || toLog==true) {
      this.createLogFile();
      this.logBool = true;
    }
  }
  // functions
  async start() {
    var countDownDate = this.getState();
    if(!countDownDate) return;
    // Update the count down every 1 second
    this.interval = setInterval(
      async function() {
        // Get today's date and time
        var now = new Date().getTime();
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
        // Time calculations for days, hours, minutes and seconds
        //var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        //var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // Display the result in the element with id="demo"
        document.getElementById(this.dispDiv).innerHTML =
          minutes + "m " + seconds + "s ";
        if (distance < 0) this.stop();
      }.bind(this),
      1000
    );
  }
  
  getState() {
    var countDownDate = new Date();
    if (this.locStorage[this.locKey]) {
      let item = this.locStorage.getItem(this.locKey);
      if(item==="stop") return false;
      countDownDate = new Date(item);
    } else {
      // Set the date we're counting down to
      countDownDate.setMinutes(countDownDate.getMinutes() + this.tLimit);
      this.locStorage.setItem(this.locKey, countDownDate);
    }
    return countDownDate;
  }
  
  restart() {
    this.clear();
    this.start();
  }
  
  clear() {
    clearInterval(this.interval);
    document.getElementById(this.dispDiv).innerHTML =
      "Good job! Time for a break.";
    this.locStorage.removeItem(this.locKey);
  }
  
  stop() {
    this.clear();
    this.locStorage.setItem(this.locKey, "stop");
    if(this.logBool) this.logEntry();
  }

  async createLogFile() {
    try {
      const pomLog = await RemNoteAPI.v0.get_by_name(this.logName);
      if (!pomLog.found) {
        this.createDocRem(this.logName, null, true);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async logEntry() {
    try {
      const pomLog = await RemNoteAPI.v0.get_by_name(this.logName);
      let dateNow = new Date();
      let fomattedDate =
        dateNow.getFullYear() +
        "-" +
        (dateNow.getMonth() + 1) +
        "-" +
        dateNow.getDate() +
        " " +
        dateNow.getHours() +
        ":" +
        dateNow.getMinutes();
      let tags = this.pomConsole.value;
      let txt = fomattedDate.toString() + " - " + tags;
      await RemNoteAPI.v0.create(txt, pomLog._id);
    } catch (e) {
      console.log(e);
    }
  }

  async createDocRem(name, parent, isDoc) {
    await RemNoteAPI.v0.create(name, parent, 0, { isDocument: isDoc });
    return "done";
  }
} // end of class

function getTag() {
  let tag = locStorage[locStorageTag];
  if (tag === undefined) {
    console.log("no tag found");
  } else {
    pomConsole.value = locStorage[locStorageTag];
  }
}

document.addEventListener("keyup", logTag);
function logTag(e) {
  locStorage.setItem(locStorageTag, pomConsole.value);
}

const pomodoro = new Pomodoro(t, "pomodoro_container", logName, pomConsole, toLog);
pomodoro.start();

document.getElementById("pomodoro_restart").onclick = () => {
  pomodoro.restart();
};
document.getElementById("pomodoro_stop").onclick = () => {
  pomodoro.stop();
};

getTag();

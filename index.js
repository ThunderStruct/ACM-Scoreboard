// JavaScript Document
/*
-Note that the countdown displayed may be in-accurate since it is set to account for a DST error. It may need reconfiguring!

-The verify button cross-references the given handle names' solved problems with the given listed problems (for the contest creator's awareness)
-The scoring system takes into account:
	* Difficulty (the points assigned to the problem, which is 500 by default and can be changed by hovering over the problem and choosing a new score)
	* The submission time relative to the contest start time
	* The number of wrong submissions
	* The submissions evaluation time (code efficiency; has minor weight) 
	***(note: the scoring equation can be customized in contest.js -> recursiveScoreUpdate())

-This scoreboard is solely created by Mohamed Shahawy (ThunderStruct)
***Permission of usage is hereby granted, free of charge.
   Permission of editing and republishing is also granted given proper crediting.
   Read the associated license file for more info***
-Feel free to make a pull request if you find any room for enhancements
	- index.js contains some defaults and all the setup div scripts
	- contest.js contains all the scoreboard/during-contest scripts
-Happy ACMing-
*/

var handles = [];	// array of strings containing the handle names
var problems = [];	// array of {problemNumber: 4, problemName: Watermelon, problemLetter: A, problemScore: 200} objects
// Debugging samples
//var sampleHandles = ["sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample"]
//var sampleProblems = [{problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}]
var duration = 0;
var startUTCDateEpoch;
var endUTCDateEpoch;
var setupDiv;
var tableDiv;
var reader;

var POSSIBLE_SCORES = [100, 250, 500, 750, 1000, 1500, 2000];

$(window).ready(function() {	// event listeners for HTML inputs
	"use strict";	
	reader = new FileReader();
  $('#userHandle')[0].addEventListener("keyup", function(event) {
	  event.preventDefault();
	  if (event.keyCode === 13) {	// return key press calls the function
		  addUser("-1");
	  }
  });
  
  $('#problemNumber')[0].addEventListener("keyup", function(event) {
	  event.preventDefault();
	  if (event.keyCode === 13) {	// return key press calls the function
		  addProblem();
	  }
  });
  
  $('#problemName')[0].addEventListener("keyup", function(event) {
	  event.preventDefault();
	  if (event.keyCode === 13) {	// return key press calls the function
		  addProblem();
	  }
  });
  $('#startTime')[0].addEventListener("keyup", function(event) {
	  event.preventDefault();
	  if (event.keyCode === 13) {	// return key press calls the function
		  $('#verifyBtn').click();
	  }
  });

  $('#endTime')[0].addEventListener("keyup", function(event) {
	  event.preventDefault();
	  if (event.keyCode === 13) {	// return key press calls the function
		  $('#verifyBtn').click();
	  }
  });

  $('#startTime').datetimepicker({format: 'DD/MM/YYYY H:mm A'});	// time-picker format init
  $('#endTime').datetimepicker({format: 'DD/MM/YYYY H:mm A'});
 
  setupDiv = $('#setupDiv');	// retaining a reference to the setupDiv for future update

  // init actions (button listeners)
  $('#addUserBtn')[0].onclick = function() { addUser("-1"); };
  $('#addProblemBtn')[0].onclick = addProblem;
  $('#verifyBtn')[0].onclick = verify;
  $('#addUserFileBtn')[0].onclick = chooseAFile;

  // init copyright label
  var yearStr = new Date().getFullYear().toString();	// updates the year to the current year
  var copyrightText = 'Copyright © ' + yearStr + ' - Mohamed Shahawy';
  $('#copyrightLbl').text(copyrightText);

  $('#fileInput').change(function (){
       	var file = document.getElementById("fileInput").files[0];
       	readFile(file);
    });

});

function readFile(file) {	// reads and parses loaded file
	reader.onload = function(event) {
		var contents = event.target.result.split("\n");  ;
		for (i in contents) {
			contents[i] = contents[i].replace(/\s/g, '')	// remove spaces
			if (contents[i].length > 0) {
				addUser(contents[i]);
				console.log("Adding user " + contents[i]);
			}
		}
		// Reset file input
		var fileInput = $('#fileInput');
		fileInput.replaceWith( fileInput = fileInput.clone( true ) );
	}

	reader.readAsText(file);	// this calls the .onload function above
}

function chooseAFile() {	// choose a file button clicked
	$('input[type=file]').trigger('click');
}

function problemSelectChanged(senderId, val) {	// callback function for when a dropdown/select list (problem points) gets changed
	var problemEntry = senderId.substring(9);
	var problemLetter = problemEntry.slice(-1);
	var problemNum = problemEntry.slice(0, -1);

	for (var i = 0; i < problems.length; i++) {
		if (problems[i].problemLetter == problemLetter && problems[i].problemNumber == problemNum) {
			problems[i].problemScore = val;
			break;
		}
	}

}

function deleteBtnClicked(senderId, unprocessedId) {	// remove problem/handle
	var isHandle = (senderId.substring(0, 8) == "handleLi");
	if (isHandle) {
		var senderHandle = unprocessedId.substring(8);
		var index = handles.indexOf(senderHandle);
		if (index > -1) {
			handles.splice(index, 1);
			// decrement counter
			$('#addedHandlesNumber')[0].innerHTML = "(" + handles.length + ")";
		}

	}
	else {	// is a problem entry (not handle)
		var problemEntry = senderId.substring(9);
		var problemLetter = problemEntry.slice(-1);
		var problemNum = problemEntry.slice(0, -1);

		for (var i = 0; i < problems.length; i++) {
			if (problems[i].problemLetter == problemLetter && problems[i].problemNumber == problemNum) {
				problems.splice(i, 1);
				// decrement counter
				$('#addedProblemsNumber')[0].innerHTML = "(" + problems.length + ")";
				break;
			}
		}

	}

	document.getElementById(unprocessedId).parentNode.removeChild(document.getElementById(unprocessedId));

}

function addUser(user) {	// add user to the handles array and add the DOM element
	"use strict";
	var handle;
	if (user == "-1")
		handle = $('#userHandle')[0].value;
	else handle = user;

	handle = handle.replace(/[\n\r]/g, ''); // carriage return char support

	// validation
	if (handle === "") {
		if (user == "-1")
			alert("Insert a valid handle");
		return;
	}

	if (handles.indexOf(handle) !== -1) {
		if (user == "-1")
			alert("The handle " + handle + " has already been added to the list");
		return;
	}
	
	handles.push(handle);
	var list = document.getElementById('handlesUl');
	var entry = document.createElement("LI");
	entry.className = "addedLi";
	var processedHandle = handle.replace(/\./g, '\\\\.');
	entry.id = "handleLi" + handle;
	var span = document.createElement("SPAN");
	span.id = "handleLi" + handle + "Span";
	span.appendChild(document.createTextNode(handle))
	entry.appendChild(span);
	// init panel
	var panel = document.createElement("DIV");
	panel.className ="LiPanel";
	panel.innerHTML += '&nbsp;';
	var deleteBtn = document.createElement("BUTTON");
	deleteBtn.className = "deleteBtn";
	deleteBtn.type = "button";
	deleteBtn.onclick = function() { deleteBtnClicked("handleLi" + processedHandle, "handleLi" +  handle); };
	var deleteBtnSpan = document.createElement("SPAN");
	deleteBtnSpan.className = "glyphicon glyphicon-minus-sign";
	deleteBtn.appendChild(deleteBtnSpan);
	panel.appendChild(deleteBtn);

	entry.appendChild(panel);
	list.appendChild(entry);
	
	// increment counter
	$('#addedHandlesNumber')[0].innerHTML = "(" + handles.length + ")";
	
	// clear text field
	$('#userHandle')[0].value = "";
	$('#userHandle')[0].focus();
}

function addProblem() {	// add problem to the problems array and add the DOM element
	"use strict";
	var problem = $('#problemNumber')[0].value;
	var problemName = $('#problemName')[0].value;
	var regex = /(\d+)/g;
	
	//validation
	if (problem === "") {
		alert("Missing or invalid input");
		return;
	}
	
	var problemNum = problem.match(regex);
	var problemLetter = problem.slice(-1).toUpperCase();
	//validation pt.2
	if (Number(problemNum) === 0 || !problemLetter[0].match(/[a-z]/i) ) {
		alert("Invalid problem format! Proper format example: 105C");
		return;
	}
	var validationFlag = true;
	problems.forEach( function(item) {
		if ((item.problemNumber === problemNum.toString() && item.problemLetter === problemLetter) || (item.problemName === problemName && problemName != "")) {
			if (item.problemName === problemName && problemName != "") {
				alert("A problem with the name '" + problemName + "' has already been added");
				validationFlag = false;
				return;
			}
			else {
				alert("A problem with the code " + problemNum.toString() + problemLetter + " has already been added");
				validationFlag = false;
				return;
			}
		}
	});
	
	if (!validationFlag) {
		return;
	}
	
	problems.push({
				problemNumber: problemNum.toString(), 
				problemLetter: problemLetter, 
				problemName: problemName, 
				problemScore: 500});	// 500 default

	var list = document.getElementById('problemsUl');
	var entry = document.createElement("LI");
	entry.className = "addedLi";
	entry.id = "problemLi" + problemNum.toString() + problemLetter;
	entry.appendChild(document.createTextNode(problemNum.toString() + problemLetter + (problemName == "" ? "" : " - " + problemName)));
	// init panel
	var panel = document.createElement("DIV");
	panel.className ="LiPanel";
	panel.innerHTML += '&nbsp;';
	// delete btn init
	var deleteBtn = document.createElement("BUTTON");
	deleteBtn.className = "deleteBtn";
	deleteBtn.type = "button";
	deleteBtn.onclick = function() { deleteBtnClicked("problemLi" + problemNum.toString() + problemLetter, "problemLi" + problemNum.toString() + problemLetter); };
	var deleteBtnSpan = document.createElement("SPAN");
	deleteBtnSpan.className = "glyphicon glyphicon-minus-sign";
	deleteBtn.appendChild(deleteBtnSpan);
	panel.appendChild(deleteBtn);
	// possible scores dropdown init
	var selector = document.createElement("SELECT");
	selector.title = "Problem score";
	for (var score in POSSIBLE_SCORES) {
   		selector.options[selector.options.length] = new Option(POSSIBLE_SCORES[score]);
	}
	selector.value = 500;
	selector.onchange = function() { problemSelectChanged("problemLi" + problemNum.toString() + problemLetter, selector.value) };

	panel.appendChild(selector);

	entry.appendChild(panel);
	list.appendChild(entry);
		
	// increment counter
	$('#addedProblemsNumber')[0].innerHTML = "(" + problems.length + ")";
	
	// clear text field
	$('#problemNumber')[0].value = "";
	$('#problemName')[0].value = "";
	$('#problemNumber')[0].focus();
}

function validateSubmission() {	// validates the start/end dates and the users' and problems' entries
	if (handles.length === 0 || problems.length === 0) {
		alert("You must insert at least 1 problem and 1 handle");
		return false;
	}
	
	var startTime = document.getElementById("startTime").value
	var endTime = document.getElementById("endTime").value;

	if (startTime === "" || endTime === "") {
		alert("Missing contest time information");
		return false;
	}

	var dateRef = new Date();

	// Initialize date/time with offset to get UTC epoch

 	startUTCDateEpoch = Number(moment(startTime, 'DD/MM/YYYY H:mm A').format('X')) - (dateRef.getTimezoneOffset() * 60);
	endUTCDateEpoch = Number(moment(endTime, 'DD/MM/YYYY H:mm A').format('X')) - (dateRef.getTimezoneOffset() * 60);

	
	duration = (endUTCDateEpoch - startUTCDateEpoch) / 60;	// in minutes

	if (duration <= 0) {
		alert("Invalid date: duration is <= 0");
		return false;
	}

	return true;
}

// Submission
$(document).ready(function() {
	// Test material
	//handles = sampleHandles
	//problems = sampleProblems

	$('#submitBtn').on('click', function() {	// Start Contest clicked

		if (!validateSubmission()) {
			return
		}

		// success
		$('#setupDiv').animate({left: '-100%'}, 750, function() {	// slide out the setupDiv and fade in the tableDiv
			tableDiv = $('#tableDiv');
			$('#tableDiv').append(HTML_CONTEST_TABLE).hide();
			prepareTable();
			$('#tableDiv').fadeIn('slow');
			$('html,body').animate({
       			scrollTop: $('#scoreboardWrapper').offset().top
       		}, 'slow');
			// start JSON callbacks schedule
			retrieveJSONData();	// test
			retrievalIntervalRef = setInterval(function() {
	   			retrieveJSONData(true);
			}, 1200 * 1000); // every 1200 seconds / 10 minutes (in ms)

		});
	});
})

function recursiveVerification(i) {	
	"use strict";

	var handleElement = $(document.getElementById('handleLi' + handles[i] + "Span"));
	handleElement.text(handles[i] + ' | processing...');

	$.ajax({
    	url: 'http://codeforces.com/api/user.status',
    	type: 'GET',
    	data: {
    		jsonp: "callback",	// enforce cross-origin policy bypass
    		handle: handles[i],
    		from: 1,
    		count: 1000
    	},
    	dataType: 'JSONP',
    	jsonpCallback: 'callback',
     	success: function(data) {
			// Callback
			var handleElement = $(document.getElementById('handleLi' + handles[i] + "Span"));
			var currentHandle = handles[i]
			var processedHandle = handles[i].replace(/\./g, '\\\\.');	// to account for dots in HTML id

			var callbackStatus = data.status;

			if (callbackStatus != "OK") {
				
				if (data.comment.match(/handle: User with handle/g).length > 0) {
					handleElement.text(currentHandle + " | user not found");
				}
				else {
					alert("Server responded with error msg: \n[" + data.comment + "]");
				}

				// continue
				if (i + 1 < handles.length) {
					setTimeout(recursiveVerification(i + 1), 200);	// 200ms / 5 requests per second max 
					//(could decrease the delay further if you factor in the download time)
				}
				if (i == handles.length - 1) {
					$('#verifyBtn').attr('disabled', false);
					$('#verifyBtn').attr('title', 'Verify');
					$('#verifyBtn').attr('value', 'Verify');
				}
				return;
			}

			// Status OK
			var resultsArr = data.result;
			var totalSolvedProblems = {};
			var solvedTxtAdded;
			var addedProblems;
			for (var j = 0, solvedTxtAdded = false, addedProblems = []; j < resultsArr.length; j++) {
				var problemData = resultsArr[j]["problem"]

				for (var k = 0; k < problems.length; k++) {
					var problem = problems[k];
					var num = parseInt(problem['problemNumber']);
					var letter = problem['problemLetter'];

					if (resultsArr[j]["verdict"] == "OK") {
						var key = parseInt(resultsArr[j]["problem"]["contestId"]) + resultsArr[j]["problem"]["index"]
						totalSolvedProblems[key] = true;
					}

					if (num == problemData['contestId'] && letter == problemData['index'] && resultsArr[j]["verdict"] == "OK") {
						// problem solved
						if ($.inArray(num.toString() + letter, addedProblems) > -1) {
							continue;
						}
						
						if (!solvedTxtAdded) {
							handleElement.text(currentHandle + " | solved: " + num + letter);
						}
						else {
							handleElement.text(handleElement.text() + ", " + num + letter);
						}
						addedProblems.push(num.toString() + letter);
						solvedTxtAdded = true;
					}
				}
			}
			
			if (!solvedTxtAdded) {
				// hasn't solved any of the listed problems
				handleElement.text(currentHandle+ " | pass");
			}

			// Total solved
			handleElement.text(handleElement.text() + " - total solved: " + Object.keys(totalSolvedProblems).length.toFixed(0) + " problem(s)")

			if (i + 1 < handles.length) {
				setTimeout(recursiveVerification(i + 1), 200);	// 200ms / 5 requests per second max 
				//(could decrease the delay further if you factor in the download time)
			}
			if (i == handles.length - 1) {
				$('#verifyBtn').attr('disabled', false);
				$('#verifyBtn').attr('title', 'Verify');
				$('#verifyBtn').attr('value', 'Verify');
			}
     	},
     	error: (jqXHR, status, error) => {
     		handleElement.text(handles[i] + " | error occured");
			if (i == handles.length - 1) {
				$('#verifyBtn').attr('disabled', false);
				$('#verifyBtn').attr('title', 'Verify');
				$('#verifyBtn').attr('value', 'Verify');
			}
			else if (i + 1 < handles.length) {
				setTimeout(recursiveVerification(i + 1), 200);	// 200ms / 5 requests per second max 
				//(could decrease the delay further if you factor in the download time)
			}
     	}
	})
}

function verify() {	// verify button clicked
	if (handles.length === 0 || problems.length === 0) {
		alert("You must insert at least 1 problem and 1 handle");
		return false;
	}

	for (var i = 0; i < handles.length; i++) {
		var handleElement = $(document.getElementById('handleLi' + handles[i] + "Span"));
		handleElement.text(handles[i]);
	}

	// success
	$('#verifyBtn').attr('title', 'Please wait...');
	$('#verifyBtn').attr('value', 'Please wait...');
	$('#verifyBtn').attr('disabled', true);

	// verification recursion (delayed to 2 requests per second to prevent server error code 503 - too many requests)
	recursiveVerification(0);	// starting from handles[0]
}


// html constant structure --- used to create the table and it's wrapper div along with other material
var HTML_CONTEST_TABLE = '<div class="wrapper" id="scoreboardWrapper" style="margin-top: -40px"> \n <div align="center" > \n <label id="blindTimeIndicator" class="setupLbl" style="display: none;" title="Score auto-update disabled">(BLIND MODE ON)</label> <br> <label id="countdownTimerLbl" class="setupLbl" title="Time remaining"> 00:00:00 </label> \n </div>  \n <div class="table" id="scoreboardTable" align="center"> \n <div class="row header" id="scoreboardTableHeader"> \n </div> \n </div> \n <div align="center"> \n &nbsp; &nbsp; &nbsp; &nbsp; <a href="javascript:toggleBlindTime()" class="hrefBtn">Blind-Time</a> \n &nbsp; &nbsp; <a href="javascript:manualUpdate()" class="hrefBtn">Update Scores</a> \n &nbsp; &nbsp; <a href="javascript:toggleFullscreen()" class="hrefBtn">Toggle Fullscreen</a> \n </div> \n <div align="center"> \n <label id="lastUpdateLbl" class="setupLbl"> last update: </label> </div> \n </div>'



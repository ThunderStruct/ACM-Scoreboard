// JavaScript Document

var scoreboardTable;
var dataIsBeingRetrieved = false;
var scores = [];
var totalScores = [];
var timeSinceRef;
var retrievalIntervalRef;
var isFullscreenMode = false;
var countdownValue;
var lastUpdateTime;
var handlesOriginalIndices = [];
var blindTimeOn = false;
var lastSubmissionData;

var retrievalCount = 0;

function prepareTable() {	// creates the table's DOM elements and initializes the countdown intervals/variables
	scoreboardTable = $('#scoreboardTable')

	for (var i = 0; i <= handles.length; i++) {
		for (var j = 0; j <= problems.length; j++) {
			if (i == 0 && j == 0) {	// handle names header
				var elem = '<div class="cell" id="handleHeader"> Handle </div>';
				$('#scoreboardTableHeader').append(elem);
			}
			else if (i == 0) {	// problems
				var name = problems[j - 1]['problemName'];
				var letter = problems[j - 1]['problemLetter'];
				var number = problems[j - 1]['problemNumber'];
			

				$('#scoreboardTableHeader').append(
						$('<div/>')
								.attr("id", "problem" + parseInt(j-1))
								.addClass("cell")
								.text(number + letter + (name == "" ? "" : " - " + name))
								.attr("title", "Points: " + parseInt(problems[j - 1]['problemScore']))
						);
			}
			else if (j == 0) {	// handle names
				$('#scoreboardTable').append(
						$('<div/>')
								.attr("id", "scoreboardRow" + parseInt(i-1))
								.addClass("row")
						);

				var key = '#scoreboardRow' + parseInt(i-1);

				$(key).append(
						$('<div/>')
								.attr("id", "scoreboardCell" + parseInt(i - 1) + ",0")
								.addClass("cell")
								.text(handles[i-1])
								.attr("title", "total score: 0")
						);
			}
			else {	// status cells
				var key = '#scoreboardRow' + parseInt(i-1);
				$(key).append(
						$('<div/>')
								.attr("id", "scoreboardCell" + parseInt(i - 1) + "," + parseInt(j))
								.addClass("cell")
								.append("<span/>")
									.text("0 / 0")
						);
			}

		}
	}

	// init original indices
	for (i in handles) {
		handlesOriginalIndices[handles[i]] = i;
	}

	// scoraboard wrapper div draggable
	$('#scoreboardWrapper').mousedown(draggableDiv);

	// init countdown
	var currMoment = Math.floor(Date.now() / 1000);
	var dstOffset = 60 * 60 * 0;	// + 60 to account for Cairo DST error (currently disabled with * 0; error seems to be fixed)
	countdownValue = endUTCDateEpoch - (currMoment + dstOffset);
	var countdownLabel = document.getElementById('countdownTimerLbl');
	countdownLabel.innerHTML =	moment().startOf('day').seconds(countdownValue).format('H:mm:ss');
	var alarmSound = new Audio('finishSound.mp3');
	var countDownRef = setInterval(function() {
		countdownValue--;
		countdownLabel.innerHTML = moment().startOf('day').seconds(countdownValue).format('H:mm:ss');

		if (countdownValue == 0) {
			clearInterval(countDownRef);
			clearInterval(retrievalIntervalRef);
			alarmSound.play();
			alert("---CONTEST ENDED---");
		}
	}, 1000);	// call every second
}

function recursiveScoreUpdate(i, s) {	// i = user handle index, s = seconds since last update (s not used yet; for future performance update)
	$.ajax({
    	url: 'http://codeforces.com/api/user.status',
    	type: 'GET',
    	data: {
    		jsonp: "callback",	// enforce cross-origin policy bypass
    		handle: handles[i],
    		from: 1,
    		count: 150
    	},
    	dataType: 'JSONP',
    	jsonpCallback: 'callback',
     	success: function(data) {
			var callbackStatus = data.status;
			if (callbackStatus != "OK") {
				alert("Server responded with error msg: \n[" + data.comment + "]");
				return;
			}
			var resultsArr = data.result;
			console.log('\nUser index: ' + i + ' - handles[index]: ' + handles[i]);

			for (var k = 0; k < problems.length; k++) {
				var problem = problems[k];
				var num = parseInt(problem['problemNumber']);
				var letter = problem['problemLetter'];

				// Score components init
				var wrongSubmissionsCount = 0;
				var correctSubmissionsCount = 0;
				var bestCorrectEfficiency = 1000000;
				var firstCorrectSubmissionTime = 0;

				for (var j = 0; j < resultsArr.length; j++) {	// retrieved results loop

					var problemData = resultsArr[j]["problem"]
					var submissionTime = resultsArr[j]["creationTimeSeconds"];	// unix timestamp
					if (submissionTime < startUTCDateEpoch || submissionTime > endUTCDateEpoch) {
						continue;	// out of contest time range
					}

					if (num == problemData['contestId'] && letter == problemData['index']) {
						// problem submitted
						if (resultsArr[j]["verdict"] == "OK") {
							// problem accepted
							correctSubmissionsCount++;
							if (bestCorrectEfficiency > resultsArr[j]["timeConsumedMillis"]) {
								bestCorrectEfficiency = resultsArr[j]["timeConsumedMillis"];
							}
							if (firstCorrectSubmissionTime == 0 || firstCorrectSubmissionTime > resultsArr[j]["creationTimeSeconds"]) {
								firstCorrectSubmissionTime = resultsArr[j]["creationTimeSeconds"];
							}

							// update last submission
							if (!lastSubmissionData || lastSubmissionData.submissionTime < submissionTime) {
								lastSubmissionData = {
									submissionTime: submissionTime * 1000,
									submissionTimeFormatted: (new Date(submissionTime * 1000)).toString(),
									problemNum: problemData.contestId,
									problemLetter: problemData.index,
									handleIndex: i,
									handle: handles[i]

								}
							}
						}
						else if (!resultsArr[j].verdict) {
							// in queue / no verdict
							continue;
						}
						else {
							// problem rejected
							wrongSubmissionsCount++;
						}

					}
				}

				if (correctSubmissionsCount + wrongSubmissionsCount == 0) {
					continue;	// no submission made
				}

				//------Scoring Equation------ 
				//---(for problem k user i)---
				//----------------------------
				var relativeSubmissionTime = firstCorrectSubmissionTime - startUTCDateEpoch;	// seconds since start of the contest
				var problemPoints = problems[k].problemScore;
				var timePenaltyFactor = (problemPoints / 2.0) / (duration / 20.0);	// penalty points per 20 minutes 
																					//set so that the contest's duration would decrease the total problem points to half
				var efficiencyScore = (timePenaltyFactor * 15.0) / (bestCorrectEfficiency == 0 ? (timePenaltyFactor * 15.0) : bestCorrectEfficiency);	// +20 minutes for best efficiency (15ms)
				var timePenalty = timePenaltyFactor * (relativeSubmissionTime / 60.0 / 20.0);
				var wrongSubmissionsPenalty = (timePenaltyFactor / 2.0) * wrongSubmissionsCount;	// 10 minutes penalty for every wrong submission
				if (correctSubmissionsCount > 0) {
					var problemScore = problemPoints - timePenalty - wrongSubmissionsPenalty + efficiencyScore;
				}
				else problemScore = 0;
				//----------------------------


				console.log("pushing score for user " + i + " (" + handles[i] + ") - problem " + problems[k].problemNumber + problems[k].problemLetter);


				scores.push({
					problemNum: problems[k].problemNumber, 
					problemLetter: problems[k].problemLetter, 
					score: problemScore, 
					handleIndex: i, 
					totalSubmissionsCount: wrongSubmissionsCount + correctSubmissionsCount,
					problemIndex: k,
					problemSubmissionTimeUNIX: firstCorrectSubmissionTime,
					problemSubmissionTimeString: getFormattedDate(firstCorrectSubmissionTime),
					isSolved: (correctSubmissionsCount > 0)
				});	

			}	

			if (i + 1 < handles.length) {
				setTimeout(recursiveScoreUpdate(i + 1, s), 100);	// 100ms / 10 requests per second max 
				//(could decrease the delay further if you factor in the download time)
			}
			if (i == handles.length - 1) {	// last user in the array i.e: recursive retrieval is done
				// post score update
				var currDate = new Date();
				lastUpdateTime = currDate.getTime() / 1000;	// seconds since epoch
				clearInterval(timeSinceRef);
				timeSinceRef = setInterval( function() { updateTimeSince(currDate) }, 1000 );	// update every second
				dataIsBeingRetrieved = false
				updateDOMElementsWithScores();
			}
		},
		error: (jqXHR, status, error) =>  {
			dataIsBeingRetrieved = false;

			if (i + 1 < handles.length) {
				setTimeout(recursiveScoreUpdate(i + 1, s), 100);	// 100ms / 10 requests per second max 
				//(could decrease the delay further if you factor in the download time)
			}
			if (i == handles.length - 1) {	// last user in the array i.e: recursive retrieval is done
				// post score update
				var currDate = new Date();
				lastUpdateTime = currDate.getTime() / 1000;	// seconds since epoch
				clearInterval(timeSinceRef);
				timeSinceRef = setInterval( function() { updateTimeSince(currDate) }, 1000 );	// update every second
				dataIsBeingRetrieved = false
				updateDOMElementsWithScores();
			}
		}
	});
}

function manualUpdate() {	// manual update clicked
	retrieveJSONData(false);

	// reset interval
	clearInterval(retrievalIntervalRef);
	if (!blindTimeOn)
		retrievalIntervalRef = setInterval(function() {
	   		retrieveJSONData(true);
		}, 600 * 1000); // every 600 seconds / 10 minutes (in ms)
}

function retrieveJSONData(isAuto) {	// isAuto can be used to differentiate between the scheduled update calls and the "update now" button's calls
	if (dataIsBeingRetrieved == true) {
		return
	}

	clearInterval(timeSinceRef);
	dataIsBeingRetrieved = true;
	$('#lastUpdateLbl').text("( last update: updating... )");
	
	scores = [];	// clear array
	var currDate = new Date() / 1000;
	retrievalCount++;
	console.log("\nRetrieval Number " + parseInt(retrievalCount) + "\n");
	recursiveScoreUpdate(0, currDate - lastUpdateTime);

}

function toggleFullscreen() {	// fades out the title to make more vertical space available
	if (!isFullscreenMode) {
		$('#headerDiv').fadeOut('slow', function() {
			isFullscreenMode = true
		});
		$('#scoreboardWrapper').animate({width: '100%', height: '100%'}, 750);
	}
	else {
		$('#headerDiv').fadeIn('slow', function() {
			isFullscreenMode = false
		});
		$('#scoreboardWrapper').animate({width: '100%', height: '100%'}, 750);
	}
}

function updateTimeSince(date) {	// updates the last update time label
	$('#lastUpdateLbl').text("( last update: " + moment(date).fromNow() + " )");
}


function updateDOMElementsWithScores() {	// updates/populates the table with the retrieved data
	totalScores = new Array(handles.length + 1).join('0').split('').map(parseFloat);

    var lastSubmission = {handleIndex: 0, problemIndex: 0, time: 0}
	for (var i = 0; i < scores.length; i++) {	// update totalScores and each problem score
		totalScores[scores[i]['handleIndex']] += scores[i]['score'];

		var cell = document.getElementById('scoreboardCell' + parseInt(handlesOriginalIndices[handles[scores[i]['handleIndex']]]) + ',' + parseInt(scores[i]['problemIndex'] + 1));
		var penalty = scores[i]['isSolved'] ? problems[scores[i]['problemIndex']]['problemScore'] - scores[i]['score'] : 0;
		cell.innerHTML = ('<span>' + scores[i]['totalSubmissionsCount']).toString() + " / " + penalty.toFixed(0) + '</span>';
		if (scores[i].problemSubmissionTimeUNIX > 0) 
			cell.title = 'Submitted at: ' + scores[i]['problemSubmissionTimeString'];
		else 
			cell.title = 'No correct submission yet';

		// last submission
		if (scores[i]['isSolved'] && scores[i]['problemSubmissionTimeUNIX'] > lastSubmission.time) {
			lastSubmission.time = scores[i]['problemSubmissionTimeUNIX'];
			lastSubmission.handleIndex = scores[i]['handleIndex'];
			lastSubmission.problemIndex = scores[i]['problemIndex'];
		}
	}

	// highlight last submission
	if (lastSubmission.time != 0) {    // if a submission exists
		var cell = document.getElementById('scoreboardCell' + handlesOriginalIndices[handles[lastSubmission.handleIndex]] + ',' + parseInt(lastSubmission.problemIndex + 1));
		cell.className = "cell lastSubmission";
	}

	console.log("Total Scores: " + totalScores);

	for (var i = 0; i < totalScores.length; i++) {
		/*if (i >= scores.length) {
			break;
		}*/
		// Set handle titles
		var cell = document.getElementById('scoreboardCell' + handlesOriginalIndices[handles[i]] + ',0');
		cell.title = 'Total score: ' + totalScores[i].toFixed(2);
	}

	// First solved problems & color coding
	scores.sort(scoreSortCompare);


	for (var i = 0; i < scores.length; i++) {
		var cell = document.getElementById('scoreboardCell' + handlesOriginalIndices[handles[scores[i]['handleIndex']]] + ',' + parseInt(scores[i]['problemIndex'] + 1));
		if (!(scores[i].isSolved)) {
			// wrong answer
			cell.className="cell wrongAnswer";
		}
		else {
			// right answer or first answer color

			var isFirstAnswer = true;
			for (var j = 0; j < scores.length; j++) {
				if (scores[i].problemIndex == scores[j].problemIndex && 
					scores[j].isSolved && 
					scores[i].problemSubmissionTimeUNIX > scores[j].problemSubmissionTimeUNIX) {
					isFirstAnswer = false;
				}
			}

			if (isFirstAnswer) {
				cell.className="cell firstAnswer";
			}
			else {
				cell.className="cell rightAnswer";
			}
		}
	}

	sortTableRows();

}

function sortTableRows() {	// sorts table rows according to scores (descending order)
	var rows = $('#scoreboardTable').find('div.row').get();
	var swapOccured = true;
	// Bubble sort - to concurrently sort multiple arrays
	for (var k = 0; k < totalScores.length && swapOccured; k++) {
		swapOccured = false;
		for (var i = 0; i < totalScores.length - 1; i++) {
			if (totalScores[i] < totalScores[i + 1]) {
				swapOccured = true;
				// swap totalScores
				var tempTS = totalScores[i];
				totalScores[i] = totalScores[i + 1];
				totalScores[i + 1] = tempTS;

				// swap table rows
				var tempR = rows[i + 1];	// + 1 to account for the header row in rows[]
				rows[i + 1] = rows[i + 2];
				rows[i + 2] = tempR;

				// swap user handles
				var tempH = handles[i];
				handles[i] = handles[i + 1];
				handles[i + 1] = tempH;
			}
		}
	}
	$('#scoreboardTable').html(rows);
}

function getFormattedDate(date) {	// used for the cells' titles ("submitted at: ")
    var newDate = new Date();
	newDate.setTime(date * 1000);
	dateString = newDate.toUTCString();
	return dateString;
}

function scoreSortCompare(a, b) {	// comparator to sort the scores array according to the problem's index in the problems[] array
	if (a.problemIndex < b.problemIndex)
    	return -1;
  	if (a.problemIndex > b.problemIndex)
    	return 1;
 	return 0;
}

function toggleBlindTime() {
	if (!blindTimeOn) {
		clearInterval(retrievalIntervalRef);
		$('#blindTimeIndicator').css('display', 'inline');
	}
	else {
		retrievalIntervalRef = setInterval(function() {
	   		retrieveJSONData(true);
		}, 600 * 1000); // every 600 seconds / 10 minutes (in ms)

		$('#blindTimeIndicator').css('display', 'none');
	}

	blindTimeOn = !blindTimeOn;
}

function getLastSubmission() {
	return lastSubmissionData
}

function draggableDiv(e){
    window.my_dragging = {};
    my_dragging.pageX0 = e.pageX;
    my_dragging.pageY0 = e.pageY;
    my_dragging.elem = this;
    my_dragging.offset0 = $(this).offset();
    function handle_dragging(e){
        var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
        var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
        $(my_dragging.elem)
        .offset({top: top, left: left});
    }
    function handle_mouseup(e){
        $('body')
        .off('mousemove', handle_dragging)
        .off('mouseup', handle_mouseup);
    }
    $('body')
    .on('mouseup', handle_mouseup)
    .on('mousemove', handle_dragging);
}




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
var contestEnded = false;
var handlesOriginalIndices = [];
var blindTimeOn = false;
var lastSubmissionData;
var cancelledSubmissionIds = [];
var tableIsDraggable = false;
var tablePrepared = false;

var retrievalCount = 0;

function prepareTable() {   // creates the table's DOM elements and initializes the countdown intervals/variables
    scoreboardTable = $('#scoreboardTable');

    for (var i = 0; i <= handles.length; i++) {
        for (var j = 0; j <= problems.length; j++) {
            if (i == 0 && j == 0) { // handle names header
                var elem = '<div class="contest-cell" id="handleHeader"> Handle </div>';
                $('#scoreboardTableHeader').append(elem);
            }
            else if (i == 0) {  // problems
                var name = problems[j - 1]['problemName'];
                var letter = problems[j - 1]['problemIndex'];
                var number = problems[j - 1]['contestId'];


                $('#scoreboardTableHeader').append(
                        $('<div/>')
                                .attr('id', 'problem' + parseInt(j-1))
                                .addClass('contest-cell')
                                .text(number + letter + (name == '' ? '' : ' - ' + name))
                                .attr('title', parseInt(problems[j - 1]['problemScore']) + ' points')
                        );
                $('#problem' + parseInt(j-1)).prepend('<span class="problem-color-code" style="background: ' + PROBLEM_COLORS[problems[j-1].problemColor] + ';"></div>');
            }
            else if (j == 0) {  // handle names
                $('#scoreboardTable').append(
                        $('<div/>')
                                .attr('id', 'scoreboardRow' + parseInt(i-1))
                                .addClass('contest-row')
                        );

                var key = '#scoreboardRow' + parseInt(i-1);

                $(key).append(
                        $('<div/>')
                                .attr('id', 'scoreboardCell' + parseInt(i - 1) + ',0')
                                .addClass('contest-cell')
                                .text(handles[i-1])
                                .attr('title', 'total score: 0')
                        );
            }
            else {  // status cells
                var key = '#scoreboardRow' + parseInt(i-1);
                $(key).append(
                        $('<div/>')
                                .attr('id', 'scoreboardCell' + parseInt(i - 1) + ',' + parseInt(j))
                                .addClass('contest-cell')
                                .append('<span/>')
                                .text('0 / 0')
                        );
            }

        }
    }

    // init legend table
    legendTable = $('.legend-table');
    legendTable.on('click', function(e){
        $(this).toggleClass('selected');
    });
    legendTable.append(
            $('<div/>', {'class': 'legend-cell'})
                .append($('<div/>', {'class': 'legend-status first-answer'}))
                .append($('<div/>', {'class': 'legend-text'}).text('First to solve problem'))
                    );
    legendTable.append(
            $('<div/>', {'class': 'legend-cell'})
                .append($('<div/>', {'class': 'legend-status right-answer'}))
                .append( $('<div/>', {'class': 'legend-text'}).text('Solved problem'))
                    );
    legendTable.append(
            $('<div/>', {'class': 'legend-cell'})
                .append($('<div/>', {'class': 'legend-status wrong-answer'}))
                .append($('<div/>', {'class': 'legend-text'}).text('Attempted problem'))
                    );

    // init original indices
    for (i in handles) {
        handlesOriginalIndices[handles[i]] = i;
    }

    // scoraboard wrapper div draggable
    $('#scoreboardWrapper').mousedown(draggableDiv);

    // init countdown
    var dstOffset = 60 * 60 * 0;    // + 60 to account for DST error (currently disabled with * 0)
    var calculatedEndTime = endUTCDateEpoch +  dstOffset;
    var calculatedStartTime = startUTCDateEpoch + dstOffset;
    var diffTime = calculatedEndTime - moment().unix();
    var countdownLabel = $('#countdownTimerLbl')[0];
    var shouldShowStartAlert = false
    if (moment().unix() > calculatedStartTime)  {   // already started
        countdownValue = moment.duration(diffTime * 1000, 'milliseconds');
        countdownLabel.innerHTML = getFormattedCountdown(countdownValue.asMilliseconds());
        contestStarted = true;
        retrieveJSONData();     // first retrieval

        // Enable floating tool buttons
        $('#toggleBlindModeBtn').removeClass('disabled');
        $('#updateScoresBtn').removeClass('disabled');
        $('#addSubtractTimeBtn').removeClass('disabled');
    }
    else {
        shouldShowStartAlert = true;
        countdownValue = moment.duration((calculatedEndTime - calculatedStartTime) * 1000, 'milliseconds');
        var startCountdown = moment.duration((calculatedStartTime - moment().unix()) * 1000, 'milliseconds');
        countdownLabel.innerHTML = '- ' + getFormattedCountdown(startCountdown.asMilliseconds());
        countdownLabel.style.opacity = 0.5;
    }

    if (calculatedEndTime < moment().unix()) {  // contest already ended
        countdownLabel.innerHTML = moment(0).utc().format('H:mm:ss');
    }

    var interval = 1000;
    var countDownRef = setInterval(function() {
        if (moment().unix() < calculatedStartTime) {    // has not started yet
            startCountdown = moment.duration(startCountdown.asMilliseconds() - interval, 'milliseconds');
            countdownLabel.innerHTML = '- ' + getFormattedCountdown(startCountdown.asMilliseconds());
            return;
        }

        if (shouldShowStartAlert) {
            // On contest start
            showToast('CONTEST STARTED!', 'success', 'short');
            shouldShowStartAlert = false;
            countdownLabel.style.opacity = 1.0
            contestStarted = true;
            retrieveJSONData();     // first retrieval

            // Enable floating tool buttons
            $('#toggleBlindModeBtn').removeClass('disabled');
            $('#updateScoresBtn').removeClass('disabled');
            $('#addSubtractTimeBtn').removeClass('disabled');
        }

        countdownValue = moment.duration(countdownValue.asMilliseconds() - interval, 'milliseconds');
        countdownLabel.innerHTML = getFormattedCountdown(countdownValue.asMilliseconds());

        if (countdownValue <= 0) {
            // CONTEST ENDED
            window.onbeforeunload = null;
            
            countdownLabel.innerHTML = moment(0).utc().format('H:mm:ss');
            contestEnded = true;
            clearInterval(countDownRef);
            clearInterval(retrievalIntervalRef);
            $('#finishSoundAudio')[0].play();
            setTimeout(function () {
                $('#finishSoundAudio')[0].pause();
            }, 3000);   // stop after 3 seconds
            console.log('%c---CONTEST ENDED---', 'color: black; font-weight:bold;');
            showToast('CONTEST ENDED!', 'success', 'long', function() {
                $('#finishSoundAudio')[0].pause();
            });

            if (!$('#addSubtractTimeBtn').hasClass('disabled'))
                $('#addSubtractTimeBtn').addClass('disabled');
            if (!$('#toggleBlindModeBtn').hasClass('disabled'))
                $('#toggleBlindModeBtn').addClass('disabled');
        }
    }, interval);   // call every second
}

function recursiveScoreUpdate(i, s) {   // i = user handle index, s = seconds since last update (s not used yet; for future performance update)
    $.ajax({
        url: 'http://codeforces.com/api/user.status',
        type: 'GET',
        data: {
            jsonp: 'callback',
            handle: handles[i],
            from: 1,
            count: 150
        },
        dataType: 'JSONP',
        jsonpCallback: 'callback',
        success: function(data) {
            var callbackStatus = data.status;
            if (callbackStatus != 'OK') {
                showToast('server responded with error msg: \n[' + data.comment + ']', 'error', 'short');
                return;
            }
            var resultsArr = data.result;
            console.groupCollapsed('User index: ' + i + ' - handles[index]: ' + handles[i]);

            for (var k = 0; k < problems.length; k++) {
                var problem = problems[k];
                var num = parseInt(problem['contestId']);
                var letter = problem.problemIndex;

                // Score components init
                var wrongSubmissionsCount = 0;
                var correctSubmissionsCount = 0;
                var bestCorrectEfficiency = 1000000;
                var firstCorrectSubmissionTime = 0;

                for (var j = 0; j < resultsArr.length; j++) {   // retrieved results loop

                    var problemData = resultsArr[j]['problem']
                    var submissionTime = resultsArr[j]['creationTimeSeconds'];  // unix timestamp
                    if (submissionTime < startUTCDateEpoch || submissionTime > endUTCDateEpoch) {
                        continue;   // out of contest time range
                    }

                    if (cancelledSubmissionIds.indexOf(resultsArr[j].id) != -1) {
                        // submission cancelled
                        // reset DOM
                        var cell = $('#scoreboardCell' + (parseInt(i) + ',' + parseInt(k + 1)).replace(/(:|\.|\[|\]|\,)/g, "\\$1"))[0];
                        cell.className = 'cell';
                        cell.innerHTML = '0 / 0';
                        continue;
                    }

                    if (num == problemData['contestId'] && letter == problemData['index']) {
                        // problem submitted
                        if (resultsArr[j]['verdict'] == 'OK') {
                            // problem accepted
                            correctSubmissionsCount++;
                            if (bestCorrectEfficiency > resultsArr[j]['timeConsumedMillis']) {
                                bestCorrectEfficiency = resultsArr[j]['timeConsumedMillis'];
                            }
                            if (firstCorrectSubmissionTime == 0 || firstCorrectSubmissionTime > resultsArr[j]['creationTimeSeconds']) {
                                firstCorrectSubmissionTime = resultsArr[j]['creationTimeSeconds'];
                            }

                            // update last submission
                            if (!lastSubmissionData || lastSubmissionData.submissionTime < submissionTime) {
                                lastSubmissionData = {
                                    submissionTime: submissionTime,
                                    submissionTimeFormatted: (new Date(submissionTime * 1000)).toString(),
                                    contestId: problemData.contestId,
                                    problemIndex: problemData.index,
                                    handleIndex: i,
                                    handle: handles[i],
                                    submissionId: resultsArr[j].id
                                };
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
                    continue;   // no submission made
                }

                //------Scoring Equation------
                //---(for problem k user i)---
                //----------------------------
                var relativeSubmissionTime = firstCorrectSubmissionTime - startUTCDateEpoch;    // seconds since start of the contest
                var problemPoints = problems[k].problemScore;
                var timePenaltyFactor = (problemPoints / 2.0) / (duration / 20.0);  // penalty points per 20 minutes
                                                                                    //set so that the contest's duration would decrease the total problem points to half
                var efficiencyScore = (timePenaltyFactor * 15.0) / (bestCorrectEfficiency == 0 ? (timePenaltyFactor * 15.0) : bestCorrectEfficiency);   // +20 minutes for best efficiency (15ms)
                var timePenalty = timePenaltyFactor * (relativeSubmissionTime / 60.0 / 20.0);
                var wrongSubmissionsPenalty = (timePenaltyFactor / 2.0) * wrongSubmissionsCount;    // 10 minutes penalty for every wrong submission
                if (correctSubmissionsCount > 0) {
                    var problemScore = problemPoints - timePenalty - wrongSubmissionsPenalty + efficiencyScore;
                }
                else problemScore = 0;
                //----------------------------


                console.log('pushing score for user ' + i + ' (' + handles[i] + ') - problem ' + problems[k].contestId + problems[k].problemIndex);


                scores.push({
                    contestId: problems[k].contestId,
                    problemIndex: problems[k].problemIndex,
                    score: problemScore,
                    handleIndex: i,
                    totalSubmissionsCount: wrongSubmissionsCount + correctSubmissionsCount,
                    problemIndex: k,
                    problemSubmissionTimeUNIX: firstCorrectSubmissionTime,
                    problemSubmissionTimeString: getFormattedDate(firstCorrectSubmissionTime),
                    isSolved: (correctSubmissionsCount > 0)
                });

            }

            console.groupEnd();
            if (i + 1 < handles.length) {
                setTimeout(recursiveScoreUpdate(i + 1, s), 100);    // 100ms / 10 requests per second max
                //(could decrease the delay further if you factor in the download time)
            }
            if (i == handles.length - 1) {  // last user in the array i.e: recursive retrieval is done
                // post score update
                var currDate = new Date();
                lastUpdateTime = currDate.getTime() / 1000; // seconds since epoch
                clearInterval(timeSinceRef);
                timeSinceRef = setInterval( function() { updateTimeSince(currDate) }, 1000);    // update every second
                dataIsBeingRetrieved = false;

                if (!blindTimeOn) {
                    updateDOMElementsWithScores();
                    console.groupEnd();
                }
                else {
                    console.groupEnd();
                    logScoresTable();
                }

                if (scores.length > 0) {
                    // enable corresponding floating tool buttons
                    $('#logLastSubmissionBtn').removeClass('disabled');
                    $('#cancelSubmissionBtn').removeClass('disabled');
                }
                else {
                    if (!$('#logLastSubmissionBtn').hasClass('disabled'))
                        $('#logLastSubmissionBtn').addClass('disabled');
                    if (!$('#cancelSubmissionBtn').hasClass('disabled'))
                        $('#cancelSubmissionBtn').addClass('disabled');
                }

                $('#updateScoresBtn').parent().removeClass('activated');
            }

        },
        error: (jqXHR, status, error) =>  {
            dataIsBeingRetrieved = false;

            if (i + 1 < handles.length) {
                setTimeout(recursiveScoreUpdate(i + 1, s), 100);    // 100ms / 10 requests per second max
                //(could decrease the delay further if you factor in the download time)
            }
            if (i == handles.length - 1) {  // last user in the array i.e: recursive retrieval is done
                // post score update
                var currDate = new Date();
                lastUpdateTime = currDate.getTime() / 1000; // seconds since epoch
                clearInterval(timeSinceRef);
                timeSinceRef = setInterval( function() { updateTimeSince(currDate) }, 1000 );   // update every second
                dataIsBeingRetrieved = false;

                if (!blindTimeOn) {
                    updateDOMElementsWithScores();
                    console.groupEnd();
                }
                else {
                    console.groupEnd();
                    logScoresTable();
                }

                if (scores.length > 0) {
                    // enable corresponding floating tool buttons
                    $('#logLastSubmissionBtn').removeClass('disabled');
                    $('#cancelSubmissionBtn').removeClass('disabled');
                }
                else {
                    if (!$('#logLastSubmissionBtn').hasClass('disabled'))
                        $('#logLastSubmissionBtn').addClass('disabled');
                    if (!$('#cancelSubmissionBtn').hasClass('disabled'))
                        $('#cancelSubmissionBtn').addClass('disabled');
                }

                $('#updateScoresBtn').parent().removeClass('activated');
            }
        }
    });
}

function retrieveJSONData(isAuto) { // isAuto can be used to differentiate between the scheduled update calls and the 'update now' button's calls
    if (dataIsBeingRetrieved == true || !contestStarted) {
        return;
    }

    clearInterval(timeSinceRef);
    dataIsBeingRetrieved = true;
    $('#lastUpdateLbl').text('updating...');

    scores = [];    // clear array
    var currDate = new Date() / 1000;
    retrievalCount++;
    console.groupCollapsed('Retrieval Number ' + parseInt(retrievalCount) + '\n');
    recursiveScoreUpdate(0, currDate - lastUpdateTime);

}

/* DEPRECATED */
function toggleFullscreen() {   // fades out the title to make more vertical space available
    if (!isFullscreenMode) {
        $('#headerDiv').fadeOut('slow', function() {
            isFullscreenMode = true;
        });
        $('#scoreboardWrapper').animate({width: '100%', height: '100%'}, 750);
    }
    else {
        $('#headerDiv').fadeIn('slow', function() {
            isFullscreenMode = false;
        });
        $('#scoreboardWrapper').animate({width: '100%', height: '100%'}, 750);
    }
}

function updateTimeSince(date) {    // updates the last update time label
    $('#lastUpdateLbl').text('updated ' + moment(date).fromNow());
}

function logScoresTable() {
    var scoreTable = {};
    /* var table = {
        ThunderStruct: {
            '4A - Watermelon': 0 / 0,
            96A: 
        },
        'a.refaat': {

        }
    };*/

    // set defaults
    for (var i = 0; i < handles.length; i++) {
        scoreTable[handles[i]] = {};
        for (var j = 0; j < problems.length; j++) {
            var problemId = problems[j].contestId.toString() + problems[j].problemIndex + ' - ' + problems[j].problemName;
            scoreTable[handles[i]][problemId] = '0 / 0';
        }
    }

    // set scores
    totalScores = new Array(handles.length + 1).join('0').split('').map(parseFloat);

    for (var i = 0; i < scores.length; i++) {
        totalScores[scores[i]['handleIndex']] += scores[i]['score'];

        var problemId = problems[scores[i]['problemIndex']].contestId.toString() + problems[scores[i]['problemIndex']].problemIndex + ' - ' + problems[scores[i]['problemIndex']].problemName;
        var penalty = scores[i]['isSolved'] ? problems[scores[i]['problemIndex']]['problemScore'] - scores[i]['score'] : 0;
        var scoreText = scores[i]['totalSubmissionsCount'].toString() + ' / ' + penalty.toFixed(0);

        scoreTable[handles[scores[i]['handleIndex']]][problemId] = scoreText;
        scoreTable[handles[scores[i]['handleIndex']]]['Total Score'] = totalScores[scores[i]['handleIndex']];
    }

    console.table(scoreTable);
    console.log('%cUpdated at ' + moment(new Date()).format('HH:mm:ss DD/MM/YYYY') + ' (local time)', 'font-weight:bold;');
    showToast('scores have been successfully logged to the console!', 'success', 'short');
}

function updateDOMElementsWithScores() {    // updates/populates the table with the retrieved data
    totalScores = new Array(handles.length + 1).join('0').split('').map(parseFloat);

    //var lastSubmission = {handleIndex: 0, problemIndex: 0, time: 0}
    for (var i = 0; i < scores.length; i++) {   // update totalScores and each problem score
        totalScores[scores[i]['handleIndex']] += scores[i]['score'];

        var cell = $('#scoreboardCell' + (parseInt(handlesOriginalIndices[handles[scores[i]['handleIndex']]]) + ',' + parseInt(scores[i]['problemIndex'] + 1)).replace(/(:|\.|\[|\]|\,)/g, "\\$1"))[0];
        var penalty = scores[i]['isSolved'] ? problems[scores[i]['problemIndex']]['problemScore'] - scores[i]['score'] : 0;
        cell.innerHTML = ('<span>' + scores[i]['totalSubmissionsCount']).toString() + ' / ' + penalty.toFixed(0) + '</span>';
        if (scores[i].problemSubmissionTimeUNIX > 0)
            cell.title = 'Submitted at: ' + scores[i]['problemSubmissionTimeString'];
        else
            cell.title = 'No correct submission yet';

        // last submission
        /*if (scores[i]['isSolved'] && scores[i]['problemSubmissionTimeUNIX'] > lastSubmission.time) {
            lastSubmission.time = scores[i]['problemSubmissionTimeUNIX'];
            lastSubmission.handleIndex = scores[i]['handleIndex'];
            lastSubmission.problemIndex = scores[i]['problemIndex'];
        }*/
    }


    /* highlight last submission
    if (lastSubmission.time != 0) {    // if a submission exists
        var cell = $('#scoreboardCell' + handlesOriginalIndices[handles[lastSubmission.handleIndex]] + ',' + parseInt(lastSubmission.problemIndex + 1))[0];
        cell.className = 'contest-cell last-submission';
    } */

    console.log('Total Scores: ' + totalScores);

    for (var i = 0; i < totalScores.length; i++) {
        /*if (i >= scores.length) {
            break;
        }*/
        // Set handle titles
        var cell = $('#scoreboardCell' + (handlesOriginalIndices[handles[i]] + ',0').replace(/(:|\.|\[|\]|\,)/g, "\\$1"))[0];
        cell.title = 'Total score: ' + totalScores[i].toFixed(2);
    }

    // First solved problems & color coding
    scores.sort(scoreSortCompare);


    for (var i = 0; i < scores.length; i++) {
        var cell = $('#scoreboardCell' + (handlesOriginalIndices[handles[scores[i]['handleIndex']]] + ',' + parseInt(scores[i]['problemIndex'] + 1)).replace(/(:|\.|\[|\]|\,)/g, "\\$1"))[0];
        if (!(scores[i].isSolved)) {
            // wrong answer
            cell.className='contest-cell wrong-answer';
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
                cell.className='contest-cell first-answer';
            }
            else {
                cell.className='contest-cell right-answer';
            }
        }
    }

    sortTableRows();

}

function sortTableRows() {  // sorts table rows according to scores (descending order)
    var rows = $('#scoreboardTable').find('div.contest-row').get();
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
                var tempR = rows[i + 1];    // + 1 to account for the header row in rows[]
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

function getFormattedDate(date) {   // used for the cells' titles ('submitted at: ')
    var newDate = new Date();
    newDate.setTime(date * 1000);
    dateString = newDate.toUTCString();
    return dateString;
}

function getFormattedCountdown(ms) {    // used for the contest countdown timer
    var value = moment.duration(ms, 'milliseconds');
    var hours = Math.floor(value.asHours());
    var mins  = Math.floor(value.asMinutes()) - hours * 60;
    var sec   = Math.floor(value.asSeconds()) - hours * 60 * 60 - mins * 60;

    return hours + ':' + ((mins > 9) ? mins : ('0' + mins)) + ':' + ((sec > 9) ? sec : ('0' + sec));
}

function scoreSortCompare(a, b) {   // comparator to sort the scores array according to the problem's index in the problems[] array
    if (a.problemIndex < b.problemIndex)
        return -1;
    if (a.problemIndex > b.problemIndex)
        return 1;
    return 0;
}

function draggableDiv(e) {
    if (!tableIsDraggable) {
        return;
    }

    window.my_dragging = {};
    my_dragging.pageX0 = e.pageX;
    my_dragging.pageY0 = e.pageY;
    my_dragging.elem = this;
    my_dragging.offset0 = $(this).offset();
    function handle_dragging(e){
        var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
        var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
        $(my_dragging.elem).offset({top: top, left: left});
    }
    function handle_mouseup(e) {
        $('body').off('mousemove', handle_dragging).off('mouseup', handle_mouseup);
    }
    $('body').on('mouseup', handle_mouseup).on('mousemove', handle_dragging);
}




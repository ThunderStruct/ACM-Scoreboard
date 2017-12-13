// JavaScript Document

function readFile(file) {   // reads and parses loaded file
    reader.onload = function(event) {
        var contents = event.target.result.split('\n');
        for (i in contents) {
            contents[i] = contents[i].replace(/\s/g, '');    // remove spaces
            if (contents[i].length > 0) {
                addUser(contents[i]);
            }
        }
        // Reset file input
        var fileInput = $('#fileInput');
        fileInput.replaceWith( fileInput = fileInput.clone( true ) );
    };

    reader.readAsText(file);    // this calls the .onload function above
}

function chooseAFile() {    // choose a file button clicked
    $('input[type=file]').trigger('click');
}

function problemSelectChanged(senderId, val) {  // callback function for when a dropdown/select list (problem points) gets changed
    var problemEntry = senderId.substring(9);
    var problemIndex = problemEntry.slice(-1);
    var contestId = problemEntry.slice(0, -1);

    for (var i = 0; i < problems.length; i += 1) {
        if (problems[i].problemIndex == problemIndex && problems[i].contestId == contestId) {
            problems[i].problemScore = val;
            break;
        }
    }

}

function deleteBtnClicked(senderId, unprocessedId) {    // remove problem/handle
    var isHandle = (senderId.substring(0, 8) == 'handleLi');
    if (isHandle) {
        var senderHandle = unprocessedId.substring(8);
        var index = handles.indexOf(senderHandle);
        if (index > -1) {
            handles.splice(index, 1);
            // decrement counter
            $('#addedHandlesNumber')[0].innerHTML = handles.length > 0 ? handles.length : '';
            $('#addedHandlesLbl')[0].innerHTML = handles.length > 0 ? (' added handle' + (handles.length == 1 ? '' : 's')) : '';
        }

    }
    else {  // is a problem entry (not handle)
        var problemEntry = senderId.substring(9);
        var problemIndex = problemEntry.slice(-1);
        var contestId = problemEntry.slice(0, -1);

        for (var i = 0; i < problems.length; i += 1) {
            if (problems[i].problemIndex == problemIndex && problems[i].contestId == contestId) {
                problems.splice(i, 1);
                // decrement counter
                $('#addedProblemsNumber')[0].innerHTML = problems.length > 0 ? problems.length : '';
                $('#addedProblemsLbl')[0].innerHTML = problems.length > 0 ? (' added problem' + (problems.length == 1 ? '' : 's')) : '';
                break;
            }
        }

    }

    $('#' + unprocessedId.replace(/(:|\.|\[|\])/g, "\\$1"))[0].parentNode.removeChild($('#' + unprocessedId.replace(/(:|\.|\[|\])/g, "\\$1"))[0]);

    setupChangeOccured();
}

function addUser(user) {    // add user to the handles array and add the DOM element
    var handle;
    if (user == '-1') {
        handle = $('#userHandle')[0].value;
    } else {
        handle = user;
    }

    handle = handle.replace(/[\n\r]/g, ''); // carriage return char support

    // validation
    if (handle === '') {
        if (user == '-1') {
            showToast('missing or invalid handle', 'error', 'short');
        }
        return;
    }

    if (handles.indexOf(handle) !== -1) {
        if (user == '-1') {
            showToast('the handle ' + handle + ' has already been added to the list', 'neutral', 'short');
        }
        return;
    }

    handles.push(handle);
    var list = $('#handlesUl')[0];
    var entry = document.createElement('LI');
    entry.className = 'added-li';
    var processedHandle = handle.replace(/\./g, '\\\\.');
    entry.id = 'handleLi' + handle;
    var span = document.createElement('SPAN');
    span.id = 'handleLi' + handle + 'Span';
    span.className = 'added-li-text';
    span.appendChild(document.createTextNode(handle))
    var statusSpan = document.createElement('SPAN');
    statusSpan.className = 'added-li-status-text';
    statusSpan.id = 'handleLi' + handle + 'StatusSpan';
    span.appendChild(statusSpan);
    entry.appendChild(span);
    // init panel
    var panel = document.createElement('DIV');
    panel.className ='li-panel';
    panel.innerHTML += '&nbsp;';
    var deleteBtn = document.createElement('BUTTON');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.onclick = function() { deleteBtnClicked('handleLi' + processedHandle, 'handleLi' +  handle); };
    var deleteBtnSpan = document.createElement('SPAN');
    deleteBtnSpan.className = 'fa fa-minus-circle';
    deleteBtn.appendChild(deleteBtnSpan);
    panel.appendChild(deleteBtn);

    entry.appendChild(panel);
    list.appendChild(entry);

    // increment counter
    $('#addedHandlesNumber')[0].innerHTML = handles.length;
    $('#addedHandlesLbl')[0].innerHTML = ' added handle' + (handles.length == 1 ? '' : 's');
    

    // clear text field
    $('#userHandle')[0].value = '';
    $('#userHandle')[0].focus();

    setupChangeOccured();
}

function addProblem(pId, pName, pColor, weight) { // add problem to the problems array and add the DOM element
    var problem;
    var problemName = '';
    var problemColor = 'White'; // default color
    if (pId != undefined && pName != undefined) {
        problem = pId;
        problemName = pName;
        problemColor = pColor ? pColor : problemColor;
    }
    else {    
        problem = $('#problemId')[0].value;
        if ($('#problemColor')[0].value) {
            problemColor = $('#problemColor')[0].value;
        }
    }

    var regex = /(\d+)/g;

    //validation
    if (problem === '') {
        showToast('missing or invalid input', 'error', 'short');
        return;
    }

    var contestId = problem.match(regex);
    var problemIndex = problem.slice(-1).toUpperCase();
    //validation pt.2
    if (Number(contestId) === 0 || !problemIndex[0].match(/[a-z]/i) ) {
        showToast('invalid problem format! Proper format example: 105C', 'error', 'short');
        return;
    }
    var validationFlag = true;
    problems.forEach( function(item) {
        if ((item.contestId === contestId.toString() && item.problemIndex === problemIndex) || (item.problemName === problemName && problemName != '')) {
            if (item.problemName === problemName && problemName != '') {
                showToast('a problem with the name "' + problemName + '" has already been added', 'neutral', 'short');
                validationFlag = false;
                return;
            }
            else {
                showToast('a problem with the code ' + contestId.toString() + problemIndex + ' has already been added', 'neutral', 'short');
                validationFlag = false;
                return;
            }
        }
    });

    if (!validationFlag) {
        return;
    }

    problems.push({
        contestId: contestId.toString(),
        problemIndex: problemIndex,
        problemName: problemName,
        problemScore: weight ? weight : 500, // 500 default
        problemColor: problemColor
    });    

    var list = $('#problemsUl')[0];
    var entry = document.createElement('LI');
    entry.className = 'added-li';
    entry.id = 'problemLi' + contestId.toString() + problemIndex;
    var textSpan = document.createElement('SPAN');
    textSpan.className = 'added-li-text';
    var liText = contestId.toString() + problemIndex + (problemName == '' ? '' : ' - ' + problemName);
    textSpan.appendChild(document.createTextNode(liText + ' - '));
    var colorSpan = document.createElement('SPAN');
    colorSpan.style.color = PROBLEM_COLORS[problemColor]
    colorSpan.innerHTML = problemColor;
    textSpan.appendChild(colorSpan);
    entry.appendChild(textSpan);
    // init panel
    var panel = document.createElement('DIV');
    panel.className ='li-panel';
    panel.innerHTML += '&nbsp;';
    // delete btn init
    var deleteBtn = document.createElement('BUTTON');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.onclick = function() { deleteBtnClicked('problemLi' + contestId.toString() + problemIndex, 'problemLi' + contestId.toString() + problemIndex); };
    var deleteBtnSpan = document.createElement('SPAN');
    deleteBtnSpan.className = 'fa fa-minus-circle';
    deleteBtn.appendChild(deleteBtnSpan);
    panel.appendChild(deleteBtn);
    // possible scores dropdown init
    var selector = document.createElement('SELECT');
    selector.title = 'Problem score';
    selector.className = 'problem-score-selector';
    for (var score in POSSIBLE_SCORES) {
        selector.options[selector.options.length] = new Option(POSSIBLE_SCORES[score]);
    }
    selector.value = weight ? weight : 500;
    selector.onchange = function() { problemSelectChanged('problemLi' + contestId.toString() + problemIndex, selector.value) };

    panel.appendChild(selector);

    entry.appendChild(panel);
    list.appendChild(entry);

    // increment counter
    $('#addedProblemsNumber')[0].innerHTML = problems.length;
    $('#addedProblemsLbl')[0].innerHTML = ' added problem' + (problems.length == 1 ? '' : 's');

    // clear text field
    $('#problemId')[0].value = '';
    $('#problemColor')[0].value = '';
    $('#problemId')[0].focus();

    setupChangeOccured();
}

function setupChangeOccured() {
    // acts as a listener to all setup-dependent variables
    var startTime = $('#startTime')[0].value;
    var endTime = $('#endTime')[0].value;

    if (startTime != '' && endTime != '' && handles.length > 0 && problems.length > 0) {
        // valid contest
        $('#copyContestBtn').removeClass('disabled');
    }
    else {
        if (!$('#copyContestBtn').hasClass('disabled'))
            $('#copyContestBtn').addClass('disabled');
    }

    if (handles.length > 0) {
        $('#logDetailedReportBtn').removeClass('disabled');
    }
    else {
        if (!$('#logDetailedReportBtn').hasClass('disabled'))
            $('#logDetailedReportBtn').addClass('disabled');
    }
}

function validateSubmission() { // validates the start/end dates and the users' and problems' entries
    if (handles.length === 0 || problems.length === 0) {
        showToast('you must insert at least 1 problem and 1 handle', 'neutral', 'short');
        return false;
    }

    var startTime = $('#startTime')[0].value;
    var endTime = $('#endTime')[0].value;

    if (startTime === '' || endTime === '') {
        showToast('missing contest time information', 'neutral', 'short');
        return false;
    }

    var dateRef = new Date();

        // Initialize date/time with offset to get UTC epoch

    startUTCDateEpoch = Number(moment.utc(startTime, 'DD/MM/YYYY H:mm A').format('X'));
    endUTCDateEpoch = Number(moment.utc(endTime, 'DD/MM/YYYY H:mm A').format('X'));


    duration = (endUTCDateEpoch - startUTCDateEpoch) / 60;  // in minutes

    if (duration <= 5) {    // to give space for some discrepencies between current unix time and chosen end time
        showToast('invalid date! duration must be at least 5 minutes', 'error', 'short');
        return false;
    }

    return true;
}

// Submission
$(document).ready(function() {
    // Test material
    //handles = sampleHandles
    //problems = sampleProblems

    $('#submitBtn').on('click', function() {    // Start Contest clicked
        if (!validateSubmission() || tablePrepared) {
            return;
        }
        
        prepareForContest(function() {  // pre-contest preparations
            // success
            tablePrepared = true;
            //$('#footerDiv').fadeOut(750);
            $('#headerDiv').addClass('small');
            $('#setupDiv').animate({opacity: '0'}, 500, function() {   // slide out the setupDiv and fade in the tableDiv
                $('#setupDiv').hide();
                tableDiv = $('#tableDiv');
                $('#tableDiv').append(HTML_CONTEST_TABLE).hide();
                prepareTable();
                $('#tableDiv').fadeIn('slow');
                $('html,body').animate({
                    scrollTop: $('#scoreboardWrapper').offset().top
                }, 'slow');
                // disable load contest
                if (!$('#loadContestBtn').hasClass('disabled'))
                    $('#loadContestBtn').addClass('disabled');

                // on page unload listener
                window.onbeforeunload = function() {
                    return 'The current contest will be lost...';
                };

                // start JSON callbacks schedule
                retrievalIntervalRef = setInterval(function() {
                    retrieveJSONData(true);
                }, 1200 * 1000); // every 1200 seconds / 10 minutes (in ms)

            });
        });
    });
})

function recursiveVerification(i) {
    var handleElement = $('#handleLi' + handles[i].replace(/(:|\.|\[|\])/g, "\\$1") + 'StatusSpan');
    handleElement.text(' | processing...');

    $.ajax({
        url: 'http://codeforces.com/api/user.status',
        type: 'GET',
        data: {
            jsonp: 'callback',
            handle: handles[i],
            from: 1,
            count: 1000
        },
        dataType: 'JSONP',
        jsonpCallback: 'callback',
        success: function(data) {
            // Callback
            var handleElement = $('#handleLi' + handles[i].replace(/(:|\.|\[|\])/g, "\\$1") + 'StatusSpan');
            var currentHandle = handles[i];
            var processedHandle = handles[i].replace(/\./g, '\\\\.');   // to account for dots in HTML id

            var callbackStatus = data.status;

            if (callbackStatus != 'OK') {

                if (data.comment.match(/handle: User with handle/g).length > 0) {
                    handleElement.text(' | user not found');
                }
                else {
                    showToast('server responded with error msg: \n[' + data.comment + ']', 'error', 'short');
                }

                // continue
                if (i + 1 < handles.length) {
                    setTimeout(recursiveVerification(i + 1), 200);  // 200ms / 5 requests per second max
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

            for (var j = 0, solvedTxtAdded = false, addedProblems = []; j < resultsArr.length; j += 1) {
                var problemData = resultsArr[j].problem;

                for (var k = 0; k < problems.length; k += 1) {
                    var problem = problems[k];
                    var num = parseInt(problem.contestId, 10);
                    var letter = problem.problemIndex;

                    if (resultsArr[j].verdict == 'OK') {
                        var key = parseInt(resultsArr[j].problem.contestId, 10) + resultsArr[j].problem.index;
                        totalSolvedProblems[key] = true;
                    }

                    if (num == problemData.contestId && letter == problemData.index && resultsArr[j].verdict == 'OK') {
                        // problem solved
                        if ($.inArray(num.toString() + letter, addedProblems) > -1) {
                            continue;
                        }

                        if (!solvedTxtAdded) {
                            handleElement.text(' | solved: ' + num + letter);
                        }
                        else {
                            handleElement.text(handleElement.text() + ', ' + num + letter);
                        }
                        addedProblems.push(num.toString() + letter);
                        solvedTxtAdded = true;
                    }
                }
            }

            if (!solvedTxtAdded) {
                // hasn't solved any of the listed problems
                handleElement.text(' | pass');
            }

            // Total solved
            handleElement.text(handleElement.text() + ' - total solved: ' + Object.keys(totalSolvedProblems).length.toFixed(0) + ' problem(s)');

            if (i + 1 < handles.length) {
                setTimeout(recursiveVerification(i + 1), 200);  // 200ms / 5 requests per second max
                //(could decrease the delay further if you factor in the download time)
            }
            if (i == handles.length - 1) {
                $('#verifyBtn').attr('disabled', false);
                $('#verifyBtn').attr('title', 'Verify');
                $('#verifyBtn').attr('value', 'Verify');
            }
        },
        error: (jqXHR, status, error) => {
            handleElement.text(' | error occured');
            if (i == handles.length - 1) {
                $('#verifyBtn').attr('disabled', false);
                $('#verifyBtn').attr('title', 'Verify');
                $('#verifyBtn').attr('value', 'Verify');
            }
            else if (i + 1 < handles.length) {
                setTimeout(recursiveVerification(i + 1), 200);  // 200ms / 5 requests per second max
                //(could decrease the delay further if you factor in the download time)
            }
        }
    })
}

function verify() { // verify button clicked
    if (handles.length === 0 || problems.length === 0) {
        showToast('you must insert at least 1 problem and 1 handle', 'neutral', 'short');
        return false;
    }

    for (var i = 0; i < handles.length; i += 1) {
        var handleElement = $('#handleLi' + handles[i].replace(/(:|\.|\[|\])/g, "\\$1") + 'StatusSpan');
        handleElement.text('');
    }

    // success
    $('#verifyBtn').attr('title', 'Please wait...');
    $('#verifyBtn').attr('value', 'Please wait...');
    $('#verifyBtn').attr('disabled', true);

    // verification recursion (delayed to 2 requests per second to prevent server error code 503 - too many requests)
    recursiveVerification(0);   // starting from handles[0]
}


function recursiveProblemNameFetch(i, completionBlock) {
    if (i >= problems.length) {
        completionBlock();
        return;
    }

    var problem = problems[i]

    if (problem.problemName) {
        recursiveProblemNameFetch(i + 1, completionBlock);
        return;
    }

    $.ajax({
        url: 'http://codeforces.com/api/contest.standings',
        type: 'GET',
        data: {
            jsonp: 'callback',
            showUnofficial: false,
            contestId: problem.contestId,
            from: 1,
            count: 1
        },
        dataType: 'JSONP',
        jsonpCallback: 'callback',
        success: function(data) {
            var allProblems = data.result.problems;
            for (var j = 0; j < allProblems.length; j++) {
                if (allProblems[j].index == problem.problemIndex) {
                    problems[i].problemName = allProblems[j].name;
                    break;
                }
            }

            if (!problems[i].problemName) {
                var problemId = problem.contestId.toString() + problem.problemIndex;
                showInputToast('an error occurred while retrieving ' + problemId + '\'s name -', 'Insert Problem Name', function(name) {
                    if (!name.match(/[a-z]/i)) {
                        // skipped
                        recursiveProblemNameFetch(i + 1, completionBlock);
                        return;
                    }

                    problems[i].problemName = name;
                    recursiveProblemNameFetch(i + 1, completionBlock);
                }, 'REMOVE', function() {
                    deleteBtnClicked('problemLi' + problem.contestId.toString() + problem.problemIndex, 'problemLi' + problem.contestId.toString() + problem.problemIndex);
                    recursiveProblemNameFetch(i, completionBlock);
                });
                return;
            }


            recursiveProblemNameFetch(i + 1, completionBlock);
        },
        error: function() {
            var problemId = problem.contestId.toString() + problem.problemIndex;
            showInputToast('an error occurred while retrieving ' + problemId + '\'s name -', 'Insert Problem Name', function(name) {
                if (!name.match(/[a-z]/i)) {
                    // skipped
                    recursiveProblemNameFetch(i + 1, completionBlock);
                    return;
                }

                problems[i].problemName = name;
                recursiveProblemNameFetch(i + 1, completionBlock);
            }, 'REMOVE', function() {
                deleteBtnClicked('problemLi' + problem.contestId.toString() + problem.problemIndex, 'problemLi' + problem.contestId.toString() + problem.problemIndex);
                recursiveProblemNameFetch(i, completionBlock);
            });
        }    
    });
}

function recursiveHandlesVerification(i, completionBlock) {
    if (i >= handles.length) {
        completionBlock();
        return;
    }

    $.ajax({
        url: 'http://codeforces.com/api/user.info',
        type: 'GET',
        data: {
            jsonp: 'callback',
            'handles': handles[i]
        },
        dataType: 'JSONP',
        jsonpCallback: 'callback',
        success: function(data) {
            if (data.status == 'OK') {
                recursiveHandlesVerification(i + 1, completionBlock);
                return;
            }

            showConfirmationToast('user "' + handles[i] + '" does not exist! <br><br>Would you like to remove them?', 'YES', 'NO', function() {
                var processedHandle = handles[i].replace(/\./g, '\\\\.');
                deleteBtnClicked('handleLi' + processedHandle, 'handleLi' +  handles[i]);
                recursiveHandlesVerification(i, completionBlock);
            }, function() {
                recursiveHandlesVerification(i + 1, completionBlock);
            });
        },
        error: function() {
            showConfirmationToast('user "' + handles[i] + '" does not exist! <br><br>Would you like to remove them?', 'YES', 'NO', function() {
                var processedHandle = handles[i].replace(/\./g, '\\\\.');
                deleteBtnClicked('handleLi' + processedHandle, 'handleLi' +  handles[i]);
                recursiveHandlesVerification(i, completionBlock);
            }, function() {
                recursiveHandlesVerification(i + 1, completionBlock);
            });
        }
    });
}

function prepareForContest(completionBlock) {
    $('.pre-contest-progress').fadeIn(400);
    $('.setup-div').animate({opacity: 0.25}, 400, function() {
        $('.setup-div').find('*').attr('disabled', true);
        $('.setup-div').find('*').on('hover', function() {});
    });
    $('html,body').animate({scrollTop: $('.pre-contest-progress').offset().top - $(window).height() / 2 + $('.pre-contest-progress').height() / 2}, 300);

    // Fetch problem names
    $('.pre-contest-loader-text').text('fetching problem names...');

    recursiveProblemNameFetch(0, function() {
        // Verify handle names
        $('.pre-contest-loader-text').text('verifying user handles...');

        recursiveHandlesVerification(0, completionBlock);
    });
}





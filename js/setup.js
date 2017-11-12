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
    var problemLetter = problemEntry.slice(-1);
    var problemNum = problemEntry.slice(0, -1);

    for (var i = 0; i < problems.length; i += 1) {
        if (problems[i].problemLetter == problemLetter && problems[i].problemNumber == problemNum) {
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
        var problemLetter = problemEntry.slice(-1);
        var problemNum = problemEntry.slice(0, -1);

        for (var i = 0; i < problems.length; i += 1) {
            if (problems[i].problemLetter == problemLetter && problems[i].problemNumber == problemNum) {
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
    span.appendChild(document.createTextNode(handle))
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
    deleteBtnSpan.className = 'glyphicon glyphicon-minus-sign';
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

function addProblem(pId, pName, weight) { // add problem to the problems array and add the DOM element
    var problem;
    var problemName;
    if (pId != undefined && pName != undefined) {
        problem = pId;
        problemName = pName;
    }
    else {    
        problem = $('#problemNumber')[0].value;
        problemName = $('#problemName')[0].value;
    }

    var regex = /(\d+)/g;

    //validation
    if (problem === '') {
        showToast('missing or invalid input', 'error', 'short');
        return;
    }

    var problemNum = problem.match(regex);
    var problemLetter = problem.slice(-1).toUpperCase();
    //validation pt.2
    if (Number(problemNum) === 0 || !problemLetter[0].match(/[a-z]/i) ) {
        showToast('invalid problem format! Proper format example: 105C', 'error', 'short');
        return;
    }
    var validationFlag = true;
    problems.forEach( function(item) {
        if ((item.problemNumber === problemNum.toString() && item.problemLetter === problemLetter) || (item.problemName === problemName && problemName != '')) {
            if (item.problemName === problemName && problemName != '') {
                showToast('a problem with the name "' + problemName + '" has already been added', 'neutral', 'short');
                validationFlag = false;
                return;
            }
            else {
                showToast('a problem with the code ' + problemNum.toString() + problemLetter + ' has already been added', 'neutral', 'short');
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
        problemScore: weight ? weight : 500});    // 500 default

    var list = $('#problemsUl')[0];
    var entry = document.createElement('LI');
    entry.className = 'added-li';
    entry.id = 'problemLi' + problemNum.toString() + problemLetter;
    entry.appendChild(document.createTextNode(problemNum.toString() + problemLetter + (problemName == '' ? '' : ' - ' + problemName)));
    // init panel
    var panel = document.createElement('DIV');
    panel.className ='li-panel';
    panel.innerHTML += '&nbsp;';
    // delete btn init
    var deleteBtn = document.createElement('BUTTON');
    deleteBtn.className = 'delete-btn';
    deleteBtn.type = 'button';
    deleteBtn.onclick = function() { deleteBtnClicked('problemLi' + problemNum.toString() + problemLetter, 'problemLi' + problemNum.toString() + problemLetter); };
    var deleteBtnSpan = document.createElement('SPAN');
    deleteBtnSpan.className = 'glyphicon glyphicon-minus-sign';
    deleteBtn.appendChild(deleteBtnSpan);
    panel.appendChild(deleteBtn);
    // possible scores dropdown init
    var selector = document.createElement('SELECT');
    selector.title = 'Problem score';
    for (var score in POSSIBLE_SCORES) {
        selector.options[selector.options.length] = new Option(POSSIBLE_SCORES[score]);
    }
    selector.value = weight ? weight : 500;
    selector.onchange = function() { problemSelectChanged('problemLi' + problemNum.toString() + problemLetter, selector.value) };

    panel.appendChild(selector);

    entry.appendChild(panel);
    list.appendChild(entry);

    // increment counter
    $('#addedProblemsNumber')[0].innerHTML = problems.length;
    $('#addedProblemsLbl')[0].innerHTML = ' added problem' + (problems.length == 1 ? '' : 's');

    // clear text field
    $('#problemNumber')[0].value = '';
    $('#problemName')[0].value = '';
    $('#problemNumber')[0].focus();

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

    startUTCDateEpoch = Number(moment(startTime, 'DD/MM/YYYY H:mm A').format('X')) - (dateRef.getTimezoneOffset() * 60);
    endUTCDateEpoch = Number(moment(endTime, 'DD/MM/YYYY H:mm A').format('X')) - (dateRef.getTimezoneOffset() * 60);


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
        if (!validateSubmission()) {
            return;
        }

        // success
        $('#setupDiv').animate({opacity: '0'}, 750, function() {   // slide out the setupDiv and fade in the tableDiv
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
            // start JSON callbacks schedule
            retrievalIntervalRef = setInterval(function() {
                retrieveJSONData(true);
            }, 1200 * 1000); // every 1200 seconds / 10 minutes (in ms)

        });
    });
})

function recursiveVerification(i) {
    var handleElement = $('#handleLi' + handles[i].replace(/(:|\.|\[|\])/g, "\\$1") + 'Span');
    handleElement.text(handles[i] + ' | processing...');

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
            var handleElement = $('#handleLi' + handles[i].replace(/(:|\.|\[|\])/g, "\\$1") + 'Span');
            var currentHandle = handles[i];
            var processedHandle = handles[i].replace(/\./g, '\\\\.');   // to account for dots in HTML id

            var callbackStatus = data.status;

            if (callbackStatus != 'OK') {

                if (data.comment.match(/handle: User with handle/g).length > 0) {
                    handleElement.text(currentHandle + ' | user not found');
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
                    var num = parseInt(problem.problemNumber, 10);
                    var letter = problem.problemLetter;

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
                            handleElement.text(currentHandle + ' | solved: ' + num + letter);
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
                handleElement.text(currentHandle+ ' | pass');
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
            handleElement.text(handles[i] + ' | error occured');
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
        var handleElement = $('#handleLi' + handles[i].replace(/(:|\.|\[|\])/g, "\\$1") + 'Span');
        handleElement.text(handles[i]);
    }

    // success
    $('#verifyBtn').attr('title', 'Please wait...');
    $('#verifyBtn').attr('value', 'Please wait...');
    $('#verifyBtn').attr('disabled', true);

    // verification recursion (delayed to 2 requests per second to prevent server error code 503 - too many requests)
    recursiveVerification(0);   // starting from handles[0]
}






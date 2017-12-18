// JavaScript Document

var lightsOn = false;

$(window).ready(function() {
    // Action button listeners
    $('.action-button').on('click', function(e){
        $('.panel').toggleClass('expanded');
        $('.hotkeys-panel').toggleClass('expanded');
        $('.fab-wrapper').toggleClass('expanded');
        $('.action-button').blur();
        e.stopPropagation();

        if (!$('.panel').hasClass('expanded')) {
            $('.panel-element').each(function(i, domObj) {
            $(this).removeClass('selected');
        });
        }
    });

    $('.fab-wrapper').on('click', function(e) {
        e.stopPropagation();
    });

    $('.hotkeys-panel').on('click', function(e) {
        e.stopPropagation();
    })

    $('.panel-element-body').on('click', function(e) {
        e.stopPropagation();
    });

    $(document).click(function() {
        $('.fab-wrapper').removeClass('expanded');
        $('.panel').removeClass('expanded');
        $('.hotkeys-panel').removeClass('expanded');
        $('.action-button').blur();

        $('.panel-element').each(function(i, domObj) {
            $(this).removeClass('selected');
        });
    });

    $(document).keypress(function(e) {
        /* Hotkeys */
        var key = e.which;

        // toggle tools button
        if (key == 116 && ($(':focus')[0] == undefined || $(':focus')[0].tagName != 'INPUT')) { // 't'
            toggleTools();
        }
        // toggle contest table dragging
        else if (key == 100 && ($(':focus')[0] == undefined || $(':focus')[0].tagName != 'INPUT')) { // 'd'
            toggleTableDragging();
        }
        // toggle fullscreen
        else if (key == 102 && ($(':focus')[0] == undefined || $(':focus')[0].tagName != 'INPUT')) { // 'f'
            toggleFullscreen();
        }
        // toggle sound
        else if (key == 109 && ($(':focus')[0] == undefined || $(':focus')[0].tagName != 'INPUT')) { // 'm'
            toggleSound();
        }
    });

    // Hotkeys activation by click
    $('#fullscreenHotkeyElement').on('click', function() {
        if ($(this).parent().hasClass('disabled')) {
            return;
        }
        toggleFullscreen();
    });

    $('#toolsHotkeyElement').on('click', function() {
        if ($(this).parent().hasClass('disabled')) {
            return;   
        }
        toggleTools();
    });

    $('#draggingHotkeyElement').on('click', function() {
        if ($(this).parent().hasClass('disabled')) {
            showToast('Contest table dragging can only be toggled when a contest is running', 'neutral', 'short');
            return;
        }
        toggleTableDragging();
    });

    $('#soundHotkeyElement').on('click', function() {
        if ($(this).parent().hasClass('disabled')) {
            return;   
        }
        toggleSound();
    });

    $('.panel-button').on('click', function(e){
        if (!$(this).hasClass('disabled') && $(this).parent().hasClass('selectable')) {
            $(this).parent().toggleClass('selected');
        }
        $(this).blur();
    });

    $('.panel-button').each(function(i, domObj) {
        $(this.closest('.panel-element-body')).toggle();
    });

    // Panel button listeners //
    $('#documentationBtn').on('click', function(e) {
        var url = 'https://github.com/ThunderStruct/ACM-Scoreboard/blob/master/README.md#acm-scoreboard'
        var success = window.open(url, '_blank');
        if (!success) {
            showToast('the request to open a new tab was blocked by your browser. Check the console for details', 'error', 'short');
            console.log('Add this domain to your Ad-Block\'s whitelist or visit the documentation manually (' + url +')');
        }

        $(this).blur();
    });

    $('#lightsBtn').on('click', function(e) {
        lightsOn = !lightsOn;
        $(this).next().find('.panel-element-title').text(lightsOn ? 'Lights On' : 'Lights Off');
        $(this).parent().toggleClass('activated');

        $('body').toggleClass('lights-on');
        document.cookie = 'lights' + '=' + lightsOn;

        // img crossfade
        $('#codeforcesImgLogo').fadeTo(150, 0.5, function() {
            $('#codeforcesImgLogo').attr('src', 'img/codeforceslogo-' + (lightsOn ? 'b' : 'w') + '.png');
        }).fadeTo(150, 1);

        $(this).blur();
    });

    $('#logDetailedReportBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('loggin a detailed report requires at least 1 user handle', 'neutral', 'long');
            return;
        }
        if (userDataRetrievalInProcess) {
            showToast('retrieval already in process...', 'neutral', 'short');
            return;
        }
        getSubmissionDetails();

        $(this).blur();
    });

    $('#logLastSubmissionBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('logging the last submission data requires at least 1 submission', 'neutral', 'long');
            return;
        }
        getLastSubmission();

        $(this).blur();
    });

    $('#copyContestBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('copying contest data requires a complete contest setup', 'neutral', 'long');
            return;
        }

        var compressedSetup = compressSetupData();

        // Copy to clipboard
        var tempArea = document.createElement('textarea');
        tempArea.value = compressedSetup;
        document.body.appendChild(tempArea);

        tempArea.select();

        try {
            var successful = document.execCommand('copy');
            if (successful) {
                showToast('encoded string copied to clipboard!', 'success', 'short');
            }
            else {
                showToast('could not copy setup data to clipboard! Check the console to copy the encoded string manually', 'error', 'long');
                console.log('setup encoded string: ' + compressedSetup);
            }
        } catch (err) {
            showToast('could not copy setup data to clipboard! Check the console to copy the encoded string manually', 'error', 'long');
            console.log('setup encoded string: ' + compressedSetup);
        }

        document.body.removeChild(tempArea);

        $(this).blur();
    });

    $('#loadContestBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('cannot load contest data while a contest is running', 'neutral', 'long');
            return;
        }
    });

    $('#loadContestInput')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            loadContestSetup($(this).val());
            $(this).val('');
            $('#loadContestBtn').parent().toggleClass('selected');
            $(this).blur();
            $('#loadContestBtn').blur();
        }
    });

    $('#addSubtractTimeBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('modifying contest duration requires a running contest', 'neutral', 'long');
            return;
        }
    }); 

    $('#modifyContestDurationInput')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            addSubtractContestTime($(this).val());
            $(this).val('');
            $('#addSubtractTimeBtn').parent().toggleClass('selected');
            $(this).blur();
            $('#addSubtractTimeBtn').blur();
        }
    });

    $('#cancelSubmissionBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('cancelling submissions requires at least 1 problem submission', 'neutral', 'long');
            return;
        }
    }); 

    $('#cancelledSubmissionIdInput')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            cancelSubmission($(this).val());
            $(this).val('');
            $('#cancelSubmissionBtn').parent().toggleClass('selected');
            $(this).blur();
            $('#cancelSubmissionBtn').blur();
        }
    });

    $('#toggleBlindModeBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('contest must be running to toggle blind time', 'neutral', 'long');
            return;
        }

        toggleBlindTime();

        if (blindTimeOn) {
            if (!$(this).parent().hasClass('activated')) {
                $(this).parent().addClass('activated');
            }
        }
        else {
            $(this).parent().removeClass('activated')
        }

        $(this).blur();
    });

    $('#updateScoresBtn').on('click', function(e) {
        if ($(this).hasClass('disabled')) {
            showToast('contest must be running to update scores', 'neutral', 'long');
            return;
        }

        if (dataIsBeingRetrieved) {
            showToast('scores are already being updated', 'neutral', 'short');
            return;
        }

        manualUpdate();

        if (!$(this).parent().hasClass('activated')) {
            $(this).parent().addClass('activated');
        }

        $(this).blur();
    });

});

function loadContestSetup(compressedString) {
    var uncompressedString = lzw_decode(compressedString);
    var jsonObj;
    try {
        jsonObj = JSON.parse(uncompressedString);
    }
    catch (e) {
        showToast('invalid setup encoded string', 'error', 'short');
        return;
    }
    // clearing previous data
    handles.splice(0, handles.length); 
    $('#handlesUl').html('');
    problems.splice(0, problems.length);
    $('#problemsUl').html('');

    // handles insertion
    jsonObj.handles.forEach(function(handle) {
        if (handle.name) {
            // v1.5+
            addUser(handle.name, handle.valid);
        }
        else {
            // backwards compatibility
            addUser(handle);
        }
    });

    // problems insertion
    jsonObj.problems.forEach(function(problem) {
        addProblem(problem.contestId + problem.problemIndex, problem.problemName, problem.problemColor, problem.problemScore);
    });

    $('#startTime').val(jsonObj.time.startTime).change();
    $('#endTime').val(jsonObj.time.endTime).change();

    // cancelled submissions
    cancelledSubmissionIds = jsonObj.cancelledSubmissions

    showToast('contest data successfully loaded!', 'success', 'short');
}

function compressSetupData() {
    // compile data
    var handlesJSONStr = JSON.stringify(handles);
    var problemsJSONStr = JSON.stringify(problems);

    var jsonObj = {}
    jsonObj.handles = JSON.parse(handlesJSONStr);
    jsonObj.problems = JSON.parse(problemsJSONStr);
    if (!startUTCDateEpoch || !endUTCDateEpoch) {
        jsonObj.time = {
            startTime: $('#startTime')[0].value, 
            endTime: $('#endTime')[0].value
        };
    }
    else {
        jsonObj.time = {
            startTime: moment.utc(new Date(startUTCDateEpoch * 1000)).format('DD/MM/YYYY H:mm A'),
            endTime: moment.utc(new Date(endUTCDateEpoch * 1000)).format('DD/MM/YYYY H:mm A')
        };
    }
    jsonObj.cancelledSubmissions = cancelledSubmissionIds
    
    var uncompressedString = JSON.stringify(jsonObj);

    // string compression
    var compressedString = lzw_encode(uncompressedString);

    return compressedString;
}

function recursiveUserDetailsRetrieval(i, completionBlock) {
    if (i >= handles.length) {
        completionBlock();
        return;
    }
    $.ajax({
        url: 'http://codeforces.com/api/user.status',
        type: 'GET',
        data: {
            handle: handles[i].name,
            from: 1,
            count: 1000
        },
        success: function(data) {
            setTimeout(function() {
                // Callback
                var handleElement = $('#handleLi' + handles[i].name.replace(/(:|\.|\[|\])/g, "\\$1") + 'Span');
                var currentHandle = handles[i].name;
                var processedHandle = handles[i].name.replace(/\./g, '\\\\.');   // to account for dots in HTML id

                var callbackStatus = data.status;

                if (callbackStatus != 'OK') {

                    detailedUserData.push({handle: currentHandle, errorMsg: 'An error occured while retrieving this user\'s data'});   
                    if (data.comment.match(/handle: User with handle/g).length > 0) {
                        showToast('user "' + handles[i].name + '" not found', 'error', 'short');
                    }
                    else {
                        showToast('server responded with error msg: \n[' + data.comment + ']', 'error', 'short');
                    }

                    // continue
                    recursiveUserDetailsRetrieval(i + 1, completionBlock);
                    
                    return;
                }

                // Status OK
                var resultsArr = data.result;

                detailedUserData.push({handle: currentHandle});
                detailedUserData[detailedUserData.length - 1].data = [];
                detailedUserData[detailedUserData.length - 1].problems = [];

                for (var j = 0; j < resultsArr.length; j += 1) {
                    var problemData = resultsArr[j].problem;

                    // detailedUserData problems pushing
                    detailedUserData[detailedUserData.length - 1].problems.push({
                        id: parseInt(resultsArr[j].problem.contestId, 10) + resultsArr[j].problem.index,
                        submissionTime: resultsArr[j].creationTimeSeconds * 1000,
                        submissionTimeFormatted: moment((new Date(resultsArr[j].creationTimeSeconds * 1000))).format('dddd, MMMM Do YYYY'),
                        verdict: resultsArr[j].verdict,
                        verdictFormatted: (resultsArr[j].verdict == 'OK' ? 'Passed' : 'Failed'),
                        submissionId: resultsArr[j].id
                    });
                }

                recursiveUserDetailsRetrieval(i + 1, completionBlock);
            }, 250);    // 250ms delay
        },
        error: function(jqXHR, type, status) {
            setTimeout(function() {
                if (jqXHR.responseJSON) {
                    console.log('Error ' + jqXHR.status.toString() + ': ' + jqXHR.responseJSON.comment)
                }
                else {
                    console.log('Error code ' + jqXHR.status.toString() + '. Make sure CORS is enabled');
                }

                switch (jqXHR.status) {
                    case 503:                // service temporarily unavailable
                    case 429:                // too many requests
                        // Try again
                        recursiveUserDetailsRetrieval(i, completionBlock);
                        break;
                    case 400:                // bad request
                        detailedUserData.push({handle: handles[i].name, errorMsg: 'This user does not exist'});
                        recursiveUserDetailsRetrieval(i + 1, completionBlock);
                        break;
                    default:
                        detailedUserData.push({handle: handles[i].name, errorMsg: 'An error has occured while retrieving this user\'s data'});
                        recursiveUserDetailsRetrieval(i + 1, completionBlock);
                }
                
            }, 250);    // 250ms delay
            
        }
    })
}

function getSubmissionDetails() {
    if (userDataRetrievalInProcess)
        return;

    if (dataIsBeingRetrieved) {     // as to not interfere with the retrieval logging
        showToast('try again after scores are done updating', 'neutral', 'short');
        return;
    }

    showToast('please wait... (check the developer console)', 'neutral', 'long');

    console.log('%cRetrieving user data. Please wait...', 'color: Grey;');
    console.log('%cThis may take a while...', 'color: DarkGrey; font-style: italic;');

    userDataRetrievalInProcess = true;
    detailedUserData.splice(0, detailedUserData.length);    // clear array

    recursiveUserDetailsRetrieval(0, function() {
        userDataRetrievalInProcess = false;

        var startTime = $('#startTime')[0].value;
        var endTime = $('#endTime')[0].value;
        var startMS;
        var endMS;
        var timeSet = false;
        if (!(startTime === '' || endTime === '')) {
            var dateRef = new Date();
            startMS = (Number(moment(startTime, 'DD/MM/YYYY H:mm A').format('X')) - (dateRef.getTimezoneOffset() * 60)) * 1000;
            endMS = (Number(moment(endTime, 'DD/MM/YYYY H:mm A').format('X')) - (dateRef.getTimezoneOffset() * 60)) * 1000;
            timeSet = true;
        }

        console.log('%c====================================================', 'color: black; font-weight:bold;')
        console.log('%cLOGGING DETAILED USER DATA', 'color: black; font-weight:bold;')
        if (timeSet) {
            console.log('%cTime-range: ', 'color: Grey;', moment((new Date(startMS))).format('dddd, MMMM Do YYYY'), ' - ', moment((new Date(endMS))).format('dddd, MMMM Do YYYY'));
        }
        else {
            console.log('%cTime-range: not set | displaying all retrievable data', 'color: Grey;');
            console.log('%c(hint: set a time range using the contest start and end date selectors in the setup screen)', 'color: DarkGrey; font-style: italic;');
        }

        for (var k = 0; k < detailedUserData.length; k += 1) {
            var userData = detailedUserData[k];

            // Filter according to selected time-range
            var filteredData = userData;


            if (userData.errorMsg != undefined) {
                console.groupCollapsed('%s\'s data', userData.handle);
                console.log('%c ' + userData.errorMsg, 'color: #c0392b;');
                console.groupEnd();
                continue;
            }

            if (timeSet) {
                // Time Set
                for (var i = 0; i < filteredData.problems.length; i += 1) {
                    var problem = filteredData.problems[i];
                    if (!(problem.submissionTime >= startMS && problem.submissionTime <= endMS)) {
                        // does not fall within the specified time-range
                        var verdictOK = problem.verdict == 'OK';
                        filteredData.problems.splice(i, 1);
                        i -= 1;
                    }
                }
            }

            // Evaluate .data after problems filtering
            filteredData.data.splice(0, filteredData.data.length);   // remove all

            for (var i = 0; i < filteredData.problems.length; i += 1) {
                var problem = filteredData.problems[i];
                var problemDayDate = moment((new Date(problem.submissionTime))).format('dddd, MMMM Do YYYY');
                var dataIdx = filteredData.data.findIndex(function(row) {
                    return row.Date == problemDayDate;
                });
                if (dataIdx === -1) {
                    // create data entry
                    filteredData.data.push({'Date': problemDayDate, 'Total Submissions': 1, 'Total Correct Submissions': problem.verdict == 'OK' ? 1 : 0});
                    continue;
                }
                // dataIdx already exists
                filteredData.data[dataIdx]['Total Submissions'] += 1;
                if (problem.verdict == 'OK') {
                    filteredData.data[dataIdx]['Total Correct Submissions'] += 1;
                }
            }


            // Logging
            console.groupCollapsed('%s\'s data', userData.handle);

            if (filteredData.problems.length == 0) {
                // no submissions available
                console.log(timeSet ? 'This user has no available submissions for the given time frame' : 'This user has no available submissions')
                console.groupEnd();
                continue;
            }

            console.table(filteredData.data);
            console.groupCollapsed('Detailed Submissions\' Report');
            for (var i in filteredData.problems) {
                var problem = filteredData.problems[i];
                if (!problem.verdict) {
                    continue;   // no verdict - possibly still in queue
                }
                console.groupCollapsed('%c  %c%s: %s', 'background-color: ' + (problem.verdict === 'OK' ? 'green' : 'red') + '; margin-right: 10px', 'background-color: transparent', problem.id, problem.verdictFormatted);
                console.log('Submission ID', problem.submissionId);
                console.log('Problem ID: %s', problem.id);
                console.log('Submission Time (in ms since epoch): ', problem.submissionTime);
                console.log('Formatted Submission Time: ', problem.submissionTimeFormatted);
                console.log('Verdict: ', problem.verdict);
                console.groupEnd();
            }
            console.groupEnd();

            console.groupEnd();
        }

        showToast('detailed report successfully logged!', 'success', 'short');
    });


}

function manualUpdate() {   // manual update clicked
    retrieveJSONData(false);
    
    // reset interval
    clearInterval(retrievalIntervalRef);
    if (!blindTimeOn) {
        retrievalIntervalRef = setInterval(function() {
            retrieveJSONData(true);
        }, 150 * 1000); // every 150 seconds / 2.5 minutes (in ms)
    }
}


function toggleBlindTime() {
    if (!blindTimeOn) {
        clearInterval(retrievalIntervalRef);
        $('#blindTimeIndicator').css('display', 'inline');
    }
    else {
        retrievalIntervalRef = setInterval(function() {
            retrieveJSONData(true);
        }, 150 * 1000); // every 150 seconds / 2.5 minutes (in ms)

        $('#blindTimeIndicator').css('display', 'none');
    }

    blindTimeOn = !blindTimeOn;
}

function getLastSubmission() {
    if (!lastSubmissionData) {
        showToast('no submissions currently available', 'error', 'short');
    }

    console.groupCollapsed('Last Accepted Submission Details');
    console.log('Handle:', lastSubmissionData.handle);
    console.log('Problem ID:', parseInt(lastSubmissionData.contestId) + lastSubmissionData.problemIndex);
    console.log('Submission ID:', parseInt(lastSubmissionData.submissionId));
    console.log('Submission Time (in seconds since epoch):', lastSubmissionData.submissionTime);
    console.log('Submission Time Formatted:', lastSubmissionData.submissionTimeFormatted);
    console.log('Verdict:', 'OK');
    console.groupEnd();
    showToast('last submission data successfully logged!', 'success', 'short');
}

function cancelSubmission(id) {
    if (isNaN(id) || !id) {    // invalid id
        showToast('invalid submission id', 'error', 'short');
        return;
    }
    var parsedId;
    if (typeof id === 'string') {
        parsedId = parseInt(id);
    }
    else 
        parsedId = id;

    if (cancelledSubmissionIds.indexOf(parsedId) === -1 && parsedId > 0) {
        cancelledSubmissionIds.push(parsedId);
        showToast('submission id successfully cancelled! Update the scores to see changes', 'success', 'long');
        return;
    }
    else if (cancelledSubmissionIds.indexOf(parsedId * -1) === -1 && parsedId < 0) {
        // not available to cancel
        showToast('submission id is not cancelled! to cancel it, remove the negative sign', 'error', 'long');
        return;
    }
    else if (cancelledSubmissionIds.indexOf(parsedId * -1) != -1 && parsedId < 0) {
        cancelledSubmissionIds.splice(cancelledSubmissionIds.indexOf(parsedId), 1);
        showToast('submission id successfully removed from the cancellation list! Update the scores to see changes', 'success', 'long');
        return;
    }

    showToast('submission id already cancelled', 'neutral', 'short');
}

function addSubtractContestTime(time) {
    if (isNaN(time) || !time) {    // invalid time
        showToast('invalid time input', 'error', 'short');
        return;
    }

    var ms = time * 1000;
    var tempCountdown;
    if (countdownValue.asMilliseconds() + ms < 0) {
        tempCountdown = 0;
    }
    else {
        tempCountdown = countdownValue.asMilliseconds() + ms;
    }

    showConfirmationToast('the timer\'s value will change to ' + getFormattedCountdown(tempCountdown), 'CONFIRM', 'DECLINE', function() {
        countdownValue = moment.duration(tempCountdown, 'milliseconds');
        endUTCDateEpoch += Number(time);
        var formattedStr = moment.utc(new Date(endUTCDateEpoch * 1000)).format('DD/MM/YYYY H:mm A');
        $('#endTime').val(formattedStr).change();
    });
}

// HOTKEYS //

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

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        $('#fullscreenHotkeyElement').find('.hotkey-description').text('Fullscreen On');
    } 
    else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
        $('#fullscreenHotkeyElement').find('.hotkey-description').text('Fullscreen Off');
    }
}

function toggleSound() {
    if ($('#finishSoundAudio')[0].volume > 0.9) {
        // mute
        $('#finishSoundAudio')[0].volume = 0;
        //showToast('finishing sound muted', 'neutral', 'short');

        $('#soundHotkeyElement').find('.hotkey-description').text('Sound Muted');
    }
    else {
        // unmute
        $('#finishSoundAudio')[0].volume = 1.0;
        //showToast('finishing sound unmuted', 'neutral', 'short');

        $('#soundHotkeyElement').find('.hotkey-description').text('Sound Unmuted');
    }
}

function toggleTools() {
    $('.fab-wrapper').toggle();
    $('.hotkeys-panel').toggle();
    $('.panel-element').each(function(i, domObj) {
        $(this).removeClass('selected');
    });

    $('#toolsHotkeyElement').find('.hotkey-description').text('Tools ' + ($('.hotkeys-panel').is( ":visible" ) ? 'Visible' : 'Invisible'));
}

function toggleTableDragging() {
    if (!contestStarted) {
        showToast('Contest table dragging can only be toggled when a contest is running', 'neutral', 'short');
        return;
    }
    tableIsDraggable = !tableIsDraggable;
    $('#draggingHotkeyElement').find('.hotkey-description').text('Contest Table Dragging ' + (tableIsDraggable ? 'On' : 'Off'));
}




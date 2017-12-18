// JavaScript Document
/*

-The verify button cross-references the given handle names' solved problems with the given listed problems (for the contest creator's awareness)
-The scoring system takes into account:
    * Difficulty (the points assigned to the problem, which is 500 by default and can be changed by hovering over the problem and choosing a new score)
    * The submission time relative to the contest start time
    * The number of wrong submissions
    * The submissions evaluation time (code efficiency; has minor weight)
    ***(note: the scoring equation can be customized in contest.js -> recursiveScoreUpdate())

-This scoreboard is solely created by Mohamed Shahawy (ThunderStruct)
***Permission of usage is hereby granted, free of charge.
   Permission of editing and republishing is also granted.
   Read the associated license file for more info
   Crediting is appreciated!***
-Feel free to make a pull request if you find any room for enhancements
    - index.js contains some defaults and all listeners
    - setup.js contains all setup-related code
    - tools.js contains all scripts related to the floating tools button
    - contest.js contains all the scoreboard/during-contest scripts
-Happy ACMing-
*/

var handles = [];   // array of {name: ThunderStruct, valid: true}
var problems = [];  // array of {contestId: 4, problemName: Watermelon, problemIndex: A, problemScore: 200, problemColor: Green} objects
var detailedUserData = [];  // used for getSubmissionDetails() - array of {handle: ThunderStruct, data: [{Date: 'Wednesday, November 23rd 2017', 'Total Submissions': 20, 'Total Correct Submissions': 13}], problems: [{id: '4A', submissionTime: 1509919933612, submissionTimeFormatted: 'Wednesday, November 23rd 2017', verdict: 'OK', verdictFormatted: 'Passed'}]} objects
// Debugging samples
//var sampleHandles = ["sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample"]
//var sampleProblems = [{contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}, {contestId: "1", problemIndex: "A", problemName: "Test"}]
var duration = 0;
var startUTCDateEpoch;  // start date in seconds since epoch
var endUTCDateEpoch;    // end date in seconds since epoch
var setupDiv;
var tableDiv;
var reader;
var contestStarted = false;
var userDataRetrievalInProcess = false;

var POSSIBLE_SCORES = [100, 250, 500, 750, 1000, 1500, 2000];
var PROBLEM_COLORS = {
    Blue: '#3498db',
    Green: '#27ae60',
    Turquoise: '#16a085',
    Yellow: '#f1c40f',
    Orange: '#e67e22',
    Red: '#c0392b',
    Gray: '#95a5a6',
    Purple: '#8e44ad',
    'Dark Blue': '#34495e',
    White: '#ecf0f1'
};

var toastrOptions;

/* LISTENERS */
$(window).ready(function() {
    reader = new FileReader();
    $('#userHandle')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            addUser("-1");
        }
    });

    $('#problemId')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            addProblem();
        }
    });

    $('select[name="colorpicker"]').simplecolorpicker({
        picker: true,
        pickerDelay: 100,
        theme: 'fontawesome',
        attachToInput: $('#problemColor'),
        displayDirection: 'top'
    });

    $('select[name="colorpicker"]').on('change', function() {
        var sel = $('select[name="colorpicker"]')[0];
        var colorName = sel.options[sel.selectedIndex].text;
        var colorHex = sel.options[sel.selectedIndex].value;

        $('#problemColor').val(colorName);
        $('#problemColor').focus();
    });

    $('#problemColor')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            addProblem();
        }
    });

    $('#startTime')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            $('#verifyBtn').click();
        }
    });

    $('#endTime')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            $('#verifyBtn').click();
        }
    });

    $('#startTime').on('input', function() {
        setupChangeOccured();
    });

    $('#endTime').on('input', function() {
        setupChangeOccured();
    });

    $('#startTime').datetimepicker({format: 'DD/MM/YYYY H:mm A'}).on('dp.change', setupChangeOccured);  // time-picker format init
    $('#endTime').datetimepicker({format: 'DD/MM/YYYY H:mm A'}).on('dp.change', setupChangeOccured);

    setupDiv = $('#setupDiv');  // retaining a reference to the setupDiv for future update

    // init actions (button listeners)
    $('#addUserBtn')[0].onclick = function() { addUser('-1'); };
    $('#addProblemBtn')[0].onclick = function(e) { addProblem(); }; // wrapper function to prevent the event from being sent to addProblem()
    $('#verifyBtn')[0].onclick = verify;
    $('#addUserFileBtn')[0].onclick = chooseAFile;

    // init copyright label
    var yearStr = new Date().getFullYear().toString();  // updates the year to the current year
    var copyrightText = 'Copyright © ' + yearStr + ' - Mohamed Shahawy';
    $('#copyrightLbl').text(copyrightText);

    $('#fileInput').change(function (){
        var file = $('#fileInput')[0].files[0];
        readFile(file);
    });

    // pace listener
    Pace.on('done', function() {
        // load light setting
        var cookie = document.cookie.match('(^|;) ?' + 'lights' + '=([^;]*)(;|$)');
        lightsOn = cookie ? (cookie[2] == 'true' ? true : false) : false;

        if (lightsOn) {
            $('#lightsBtn').next().find('.panel-element-title').text(lightsOn ? 'Lights On' : 'Lights Off');
            $('#lightsBtn').parent().toggleClass('activated');
            $('body').toggleClass('lights-on');
        }

        $('.loading-page').fadeOut();

        Pace.options.ajax = false;


    });

    // Toast init
    toastr.options.closeButton = true;
    toastr.options.closeMethod = 'fadeOut';
    toastr.options.closeEasing = 'swing';
    toastr.options.closeDuration = 300;

    // Version link
    $('.version-label').on('click', function() {
        var url = 'https://github.com/ThunderStruct/ACM-Scoreboard/blob/master/CHANGELOG.md#150---2017-12-18'
        var success = window.open(url, '_blank');
        if (!success) {
            showToast('the request to open a new tab was blocked by your browser. Check the console for details', 'error', 'short');
            console.log('Add this domain to your Ad-Block\'s whitelist or visit the changelog manually (' + url +')');
        }

        $(this).blur();
    });

});



function showToast(text, type, duration, onHide) {
    var msg = text.charAt(0).toUpperCase() + text.slice(1);
    var timeOutDuration = duration == 'short' ? 3000 : 5000;    // short: 3 seconds  -- long: 5 seconds
    
    toastr.clear(); // clear current toastr to show next
    resetToastrOptions();

    toastr.options.timeOut = timeOutDuration;
    toastr.options.onHidden = onHide;
    if (type == 'error') {
        toastr.error(msg);
    }
    else if (type == 'success') {
        toastr.success(msg);
    }
    else {  // type == 'neutral'
        toastr.info(msg);
    }
}

function showConfirmationToast(text, acceptBtnText, cancelBtnText, acceptCallback, cancelCallback) {
    var msg = text.charAt(0).toUpperCase() + text.slice(1);
    var html = msg + '&nbsp<button id="toastrAcceptBtn" class="setup-submission-btn" style="color: #ecf0f1; display: inline-block; background-color: var(--primary-active); font-size: 10px; width: 70px; height: 25px;">' + acceptBtnText + '</button>&nbsp' +
    '<button id="toastrCancelBtn" class="setup-submission-btn" style="color: #ecf0f1; display: inline-block; background-color: var(--secondary-destructive); font-size: 10px; width: 70px; height: 25px;">' + cancelBtnText + '</button>';
    
    toastr.clear(); // clear current toastr to show next
    resetToastrOptions();

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.closeButton = false;
    toastr.options.tapToDismiss = false;
    var toast = toastr.info(html);

    $('#toastrAcceptBtn').on('click', function() {
        acceptCallback();
        toast.fadeOut('300', function() {
            toast.remove();
        });
    });

    $('#toastrCancelBtn').on('click', function() {
        toast.fadeOut('300', function() {
            toast.remove();
        });
        if (cancelCallback) {
            cancelCallback();
        }
    });
}

function showInputToast(text, placeholder, callback, declineText, declineCallback) {
    var msg = text.charAt(0).toUpperCase() + text.slice(1);
    var html = msg + '&nbsp<input id="toastInput" placeholder="' + placeholder + '" style="margin-left: 5px; display: inline-block; padding: 5px;" type="text" />';

    if (declineText) {
        html = html + 
        '&nbsp&nbsp or &nbsp<button id="toastrCancelBtn" class="setup-submission-btn" style="color: #ecf0f1; display: inline-block; background-color: var(--secondary-destructive); font-size: 10px; width: 70px; height: 25px;">' + declineText + '</button>';
    }

    toastr.clear(); // clear current toastr to show next
    resetToastrOptions();

    toastr.options.timeOut = 0;
    toastr.options.extendedTimeOut = 0;
    toastr.options.closeButton = false;
    toastr.options.tapToDismiss = false;
    var toast = toastr.info(html);

    $('#toastInput')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
        if (event.keyCode === 13) {   // return key
            callback($(this).val());
            toast.fadeOut('300', function() {
                toast.remove();
            });
        }
    });

    $('#toastrCancelBtn').on('click', function() {
        toast.fadeOut('300', function() {
            toast.remove();
            if (declineCallback) {
                declineCallback();
            }
        });
    });
}

function resetToastrOptions() {
    toastr.options.closeButton = true;
    toastr.options.extendedTimeOut = 1000;
    toastr.options.tapToDismiss = true;
}

// minified HTML contest view --- used to create the table and its wrapper div along with other material
// Used instead of jquery's load method + external view to minimize ajax load time
var HTML_CONTEST_TABLE = '<div class="contest-wrapper" id="scoreboardWrapper" style="margin-top: -40px"><div align="center"><label id="countdownTimerLbl" class="setup-lbl" title="Time remaining">00:00:00</label><div class="legend-table"></div></div><table class="contest-table" id="scoreboardTable" align="center"><tr class="contest-row header" id="scoreboardTableHeader"></tr></table><br><div align="center"><label id="lastUpdateLbl" class="setup-lbl">contest has not started yet</label><br><label id="blindTimeIndicator" class="setup-lbl" style="display: none; opacity: 0.25;" title="Score auto-update disabled">BLIND TIME</label></div></div>'





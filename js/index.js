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

var handles = [];   // array of strings containing the handle names
var problems = [];  // array of {problemNumber: 4, problemName: Watermelon, problemLetter: A, problemScore: 200} objects
var detailedUserData = [];  // used for getSubmissionDetails() - array of {handle: ThunderStruct, data: [{Date: 'Wednesday, November 23rd 2017', 'Total Submissions': 20, 'Total Correct Submissions': 13}], problems: [{id: '4A', submissionTime: 1509919933612, submissionTimeFormatted: 'Wednesday, November 23rd 2017', verdict: 'OK', verdictFormatted: 'Passed'}]} objects
// Debugging samples
//var sampleHandles = ["sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample", "sample"]
//var sampleProblems = [{problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}, {problemNumber: "1", problemLetter: "A", problemName: "Test"}]
var duration = 0;
var startUTCDateEpoch;  // start date in seconds since epoch
var endUTCDateEpoch;    // end date in seconds since epoch
var setupDiv;
var tableDiv;
var reader;
var contestStarted = false;
var userDataRetrievalInProcess = false;

var POSSIBLE_SCORES = [100, 250, 500, 750, 1000, 1500, 2000];

/* LISTENERS */
$(window).ready(function() {
    reader = new FileReader();
    $('#userHandle')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
      if (event.keyCode === 13) {   // return key
        addUser("-1");
      }
    });

    $('#problemNumber')[0].addEventListener('keyup', function(event) {
        event.preventDefault();
      if (event.keyCode === 13) {   // return key
        addProblem();
      }
    });

    $('#problemName')[0].addEventListener('keyup', function(event) {
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
    $('#addProblemBtn')[0].onclick = addProblem;
    $('#verifyBtn')[0].onclick = verify;
    $('#addUserFileBtn')[0].onclick = chooseAFile;

    // init copyright label
    var yearStr = new Date().getFullYear().toString();  // updates the year to the current year
    var copyrightText = 'Copyright © ' + yearStr + ' - Mohamed Shahawy';
    $('#copyrightLbl').text(copyrightText);

    $('#fileInput').change(function (){
        var file = $('#fileInput').files[0];
        readFile(file);
    });

    // pace listener
    Pace.on('done', function() {
        $('.loading-page').fadeOut();
    });

    // Toast init
    toastr.options.closeButton = true;
    toastr.options.closeMethod = 'fadeOut';
    toastr.options.closeEasing = 'swing';
    toastr.options.closeDuration = 300;
});

function showToast(msg, type, duration) {
    var timeOutDuration = duration == 'short' ? 3000 : 5000;    // short: 3 seconds  -- long: 5 seconds
    
    toastr.clear(); // clear current toastr to show next
    if (type == 'error') {
        toastr.error(msg, {timeOut: timeOutDuration});
    }
    else if (type == 'success') {
        toastr.success(msg, {timeOut: timeOutDuration});
    }
    else {  // type == 'neutral'
        toastr.info(msg, {timeOut: timeOutDuration});
    }
}

// minified HTML contest view --- used to create the table and its wrapper div along with other material
// Used instead of jquery's load method + external view to minimize ajax load time
var HTML_CONTEST_TABLE = '<div class="contest-wrapper" id="scoreboardWrapper" style="margin-top: -40px"> \n <div calss="contest-info-wrappe" align="center"> \n <label id="countdownTimerLbl" class="setup-lbl" title="Time remaining"> 00:00:00 </label> \n <div class="legend-table"> \n </div> \n </div>  \n <div class="contest-table" id="scoreboardTable" align="center"> \n <div class="contest-row header" id="scoreboardTableHeader"> \n </div> \n </div> \n <br> <div align="center"> \n <label id="lastUpdateLbl" class="setup-lbl">contest has not started yet</label> <br> \n <label id="blindTimeIndicator" class="setup-lbl" style="display: none; opacity: 0.25;" title="Score auto-update disabled">BLIND TIME</label> </div> \n </div> <audio controls hidden="hidden" id="finishSoundAudio"> <source src="sounds/finishSound.mp3", type="audio/mpeg"> </audio>'





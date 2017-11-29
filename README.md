# ACM Scoreboard
(developed for codeforces.com)

## Notes

* The table scores *ONLY* the submissions in the given time period (even if the entire contest's time is in the past)
- Moreover, this feature can be taken advantage of in case one would like to adjust anything while the contest is on-going or in case a technical problem occured by simply recreating the contest

* User handles' files should be plain text files that contain `'\n'` separated handles (`'%0D'` carriage return character is accounted for)

## Usage

#### Hosted Version (recommended)

The scoreboard is already [hosted](http://www.thunderstruct.com/acm-scoreboard/), tested, and ready to use!

_Note: the server sleeps for 1 hour daily at 1AM GMT. If that's an issue, consider the next option_

#### Localhost

To ensure absolute control over the running environment, clone the project and run it on a local (or remote) HTTP server.

_Note: Python is required for the following steps_

1. `cd` to a desired directory to contain all the project files
2. `git clone https://github.com/ThunderStruct/ACM-Scoreboard.git`
3. `python -m SimpleHTTPServer` for Python 2.x. Alternatively, use `python -m http.server` for Python 3.x
4. The scoreboard is now accessible through port 8000 (`localhost:8000`)

_Warning: the server, whether local or remote, *must* be using HTTP protocol, not HTTPS or other, since the Codeforces API is hosted on an HTTP server_

## Tools

Some useful tools are found in the floating tools button at the bottom-right corner of the screen!


#### Documentation

This method provides a reference by opening the website's documentation in a new tab

No Requirements

#### Log Detailed Report

This method displays more detailed information corresponding to each entered Codeforces handle in the developer console.

*note: this method logs potentially large amounts of data, and developer consoles on many browsers might hide part of the report if the console is not open. To avoid that issue, make sure the developer console is _open_ while using this tool*

Requirements:
  - At least 1 entered user handle
  - Setup start time and end time (optional - filters out the the details that do not fall in the given time range)

The results of the method *per handle* include:
  - Handle name
  - A table of total submissions count and correct submissions count grouped by day
  - A list of grouped details of each submission
  
![getSubmissionDetails() example](https://i.imgur.com/yyq6AU6.png)

#### Log Last Submission

This method displays the last *accepted* submission's data as of the time it's called in the developer console

Requirements:
  - At least 1 problem submission

The results of the method include:
  - Handle name
  - The last submission's problem details
  
  
#### Copy Contest
  
  This tool generates an encoded, compressed string and copies it to the clipboard. It is recommended to always have that encoded string in case of an accidental page-refresh or any technical issue to easily load the contest quickly without re-entering the data
  
  Requirements:
  - At least 1 entered user handle
  - At least 1 entered problem data
  - Contest start and end times
  
  *note: ~~the generated string does _NOT_ contain cancelled submissions' data. All cancelled submissions must be re-entered!~~ the generated string contains all cancelled submissions' data as of version 1.1.0*
  

#### Load Contest

This tool takes a previously generated encoded setup string (using the Copy Contest tool), decodes it, and loads the setup data

Requirements:
- To be in _setup_ mode (contest not started)


#### Cancel Submission

This tool takes a codeforces submission ID (can be found using Log Detailed Report or, alternatively, `console.log(scores)` in the developer console) to cancel it incase of an illegal submission or similar

As of version 1.2.0, a submission ID can be removed from the cancellation list simply by adding a negative `-` sign before the ID

Scores _must_ be updated afterwards to see effect

~~*note: currently, the only way to _undo_ this action is to setup the contest again*~~

Requirements:
- At least 1 problem submission


#### Toggle Blind Mode

This method toggles the _blind_ mode on and off. During blind time, automatic score updating is disabled (can still be manually updated, however)

Requirements:
- Contest must be running

#### Update Scores

This method manually updates the scores and resets the automatic updater's interval

Requirements:
- Contest must be running

## Instructions

The verify button in the setup screen cross-references the given handle names' solved problems with the given listed problems (for the contest creator's awareness)

The contest table's rows are dynamically sorted descendingly (top-scorer at the top) after each update

The duration displayed above the scoreboard has a max value of 24 hours. It can be easily adjusted for more in contest.js (`prepareTable()`)

The scoreboard updates the data automatically once every 3 minutes from the last update

The start and end time entered in the setup screen _MUST_ be in UTC (GMT), otherwise the behavior of the scoring equation is unknown

The table scores *ONLY* the submissions in the given time period (even if the entire contest's time is in the past)

The scoreboard table shows the retrieved data in the form of (number of submissions / total problem penalties)

Color coding:
- Red: only wrong submission(s)
- Light green: at least 1 correct submission
- Dark green: first submission of a sepcific problem

The scoreboard table wrapper is draggable. This feature was added to help with projectors' misalignment and similar cases.

## Scoring

* Difficulty (the points assigned to the problem, which is 500 by default and can be changed by hovering over the problem and choosing a new score)
* The submission time relative to the contest start time
* The number of wrong submissions
* The submissions evaluation time (code efficiency; has minor weight)
* All scoring components are based on a time-related factor.
1. 20 minutes = [(problemPoints / 2) / (duration / 20)] points
2. The above formula would penalize a last-second submission by half the problem points
3. Each wrong submission is penalized by 10 minutes
4. Problem evaluation time gives up to 20 minutes bonus (for a 15ms submission)
* Wrong submissions on unsolved problems do not affect the total scores.

Title attributes are assigned to the contest table's cells for convenience

* Hovering over any problem in the header row of the contest table will display its score points
* Hovering over any submission cell will display the last submission's date/time
* Hovering over any handle will display the user's current total score

*note: the scoring equation can be customized in contest.js -> recursiveScoreUpdate()*

## Credits
- This scoreboard is solely created by Mohamed Shahawy (ThunderStruct)
- Hubspot's [PACE](github.hubspot.com/pace/docs/welcome/) loading screen is used
- Matthew Crumley's SO [post](https://stackoverflow.com/a/294421/3551916) on LZW string compression

**Happy ACMing!**

## Todos

  - [x] Add a "legend" over the scoreboard to describe the color coding scheme (added in 1.1.0)

  - [x] Add the cancelled submissions to the encoded setup string generated by the Copy Contest tool (added in 1.1.0)

  - [ ] Add a tool to edit the contest time (add or subtract x minutes from remaining duration)
  
  - [ ] A more detailed external documentation page
  
  - [ ] Add a tool to enable/disable contest table dragging
  
  - [x] Show a confirmation alert on page-unloading attempts while a contest is running (added in 1.1.1)
  
  #### Contribution Guide
  
  Feel free to make a pull request if you find any room for enhancements or fixing bugs. The following brief file descriptions should be helpful!
  
  - index.js: some defaults and general initializers
  - contest.js: all the scoreboard/during-contest scripts
  - tools.js: the floating tools scripts
  - setup.js: all the setup screen scripts

## License
[MIT](https://github.com/ThunderStruct/ACM-Scoreboard/blob/master/LICENSE)


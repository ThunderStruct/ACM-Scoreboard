# ACM Scoreboard
(designed for codeforces.com)

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

## Console Commands / Methods

Some useful functions are available and callable through the browser's developer console. All console methods' results and output are also neatly displayed in the developer console.

#### getSubmissionDetails()

This method displays more detailed information corresponding to each entered Codeforces handle.

  - Parameters: none
  - Return Type: string - either "success" or error details
  - Prerequisites: 1 or more handles AND `verify()` must be called either through the console or by clicking the 'Verify' button

While `verify()` must be called for this function to work, the entered problem(s) do not affect its result.

The results of the method *per handle* include:
  - Handle name
  - A table of total submissions count and correct submissions count grouped by day
  - A list of grouped details of each submission
  
![getSubmissionDetails() example](https://i.imgur.com/nGgFjS5.png)

#### getLastSubmission()

This method displays the last *accepted* submission's data as of the time it's called

  - Parameters: none
  - Return Type: string - either "success" or error details
  - Prerequisites: the contest must be started AND at least 1 accepted submission must be shown on the contest table

The results of the method include:
  - Handle name
  - The last submission's problem details

## Instructions

The verify button in the setup screen cross-references the given handle names' solved problems with the given listed problems (for the contest creator's awareness)

Blind-Time mode can be activated using the respective button beneath the scoreboard. If blind mode is on, the score will not automatically update.

The contest table's rows are dynamically sorted descendingly (top scorer at the top) after each update

The duration displayed above the scoreboard has a max value of 24 hours. It can be easily adjusted for more in contest.js -> prepareTable()

The scoreboard updates the data automatically once every 10 minutes from the last update.

The start and end time entered in the setup screen MUST be in UTC (GMT), otherwise the behavior of the scoring equation is unknown

The table scores *ONLY* the submissions in the given time period (even if the entire contest's time is in the past).

The scoreboard table shows the retrieved data in the form of (number of submissions / total problem penalties)

Color coding:
- Red: only wrong submission(s)
- Light green: at least 1 correct submission
- Dark green: first submission of a sepcific problem

The scoreboard table wrapper is draggable. This feature was added to help with projectors' mulfunctioning alignment and similar cases.

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

*(note: the scoring equation can be customized in contest.js -> recursiveScoreUpdate())*

## Credit
- This scoreboard is solely created by Mohamed Shahawy (ThunderStruct)
- Feel free to make a pull request if you find any room for enhancements!
- *Guide*:
  - index.js contains some defaults and all the setup scripts
  - contest.js contains all the scoreboard/during-contest scripts

**Happy ACMing!**

## License
[MIT](https://github.com/ThunderStruct/ACM-Scoreboard/blob/master/LICENSE)


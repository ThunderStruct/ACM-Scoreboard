# ACM Scoreboard
(designed for codeforces.com)

## Notes

* The table scores *ONLY* the submissions in the given time period (even if the entire contest's time is in the past)
- Moreover, this feature can be taken advantage of in case one would like to adjust anything while the contest is on-going or in case a technical problem occured by simply recreating the contest

* User handles' files should be plain text files that contain `'\n'` separated handles (`'%0D'` character is accounted for)

## Usage

#### Hosted Version

The scoreboard is [hosted](http://thunderstruct.000webhostapp.com), tested, and ready to use!
_Note: the web-hosting service used above is free and unreliable (regular sleep time, etc...). Consider cloning the project to your own web-host or running it on a local server_

#### Localhost (recommended)

To ensure smooth and reliable usage, it is recommended to clone the project and run it on a local (or remote) HTTP server.
_Note: Python is required for the following steps_

1. `cd` to a desired directory to contain all the project files
2. `git clone https://github.com/ThunderStruct/ACM-Scoreboard.git`
3. `python -m SimpleHTTPServer` for Python 2.x. Alternatively, `python -m http.server` for Python 3.x
4. The scoreboard is now accessible through port 8000 (`localhost:8000`)

## Instructions

The verify button in the setup screen cross-references the given handle names' solved problems with the given listed problems (for the contest creator's awareness)

Blind-Time mode can be activated using the respective button beneath the scoreboard. If blind mode is on, the score will not automatically update.

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

*(note: the scoring equation can be customized in contest.js -> recursiveScoreUpdate())*

## Credit
- This scoreboard is solely created by Mohamed Shahawy (ThunderStruct)
- Feel free to make a pull request if you find any room for enhancements!
- *Guide*:
- index.js contains some defaults and all the setup scripts
- contest.js contains all the scoreboard/during-contest scripts

**Happy ACMing!**

## License
MIT


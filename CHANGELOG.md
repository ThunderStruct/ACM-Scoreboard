# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 1.3.0 - 2017-12-08
### Added
  - A shortcut button to enable/disable contest table dragging
  - A tool button to add/subtract time from the duration of a running contest
  - Support for contest durations more than or equal to 24 hours
  - Confirmation toast notifications for critical changes in the contest
  - Hotkeys for regularly-used tools

### Changed
  - Significantly enhanced performance by decreasing dependencies
  - Design changes

### Fixes
  - A bug that caused multiple contest tables to appear if the "START CONTEST" button
  is clicked repetitively
  - A bug that was caused by not accounting for empty values inserted into the cancelled 
  submissions input

## 1.2.2 - 2017-12-4
### Fixed
  - Handles being redundantly displayed when an error occurs during verification
  - The manual score-update button spinning erroneous interruption upon hover

## 1.2.1 - 2017-12-2
### Fixed
  - A bug that prevented loading user handles from a file

## 1.2.0 - 2017-11-29
### Added
  - Removing a submission ID from the cancelled submissions list
  
### Changed
  - The added handles and problems lists' design
  - Title redesign

### Fixed
  - A bug caused by not accounting for invalid submission IDs when cancelling a 
  submission

## 1.1.1 - 2017-11-28
### Added
  - Alert prompt on page-unload during a contest to prevent accidental page-refresh

## 1.1.0 - 2017-11-28
### Added
  - A legend over the scoreboard to describe the color-coding scheme
  
### Changed
  - The copy-contest tool now copies cancelled submissions
  
### Fixed
  - A bug that resulted in an erroneous warning when cancelling a submission

## 1.0.1 - 2017-11-13
### Added
  - An extra button to the tools floating menu to refer to the website's 
  documentation

### Changed
  - Some of the toasts' wording for better clarity
  
### Fixed
  - A tiny bug that caused detailed report logging to be interrupted if one of the 
  handles are invalid or a server error occured

## 1.0.0 - 2017-11-12
### Added
- `cancelSubmission(id)`  method to rule out a submission (using its submission ID) 
from the scoring process
- The ability to copy the contest's "setup" (an encoded string of all handles, 
problems, and contest start/end time) to clipboard. This feature helps save the setup 
time when the same contest is supposed run on multiple computers or simply in the 
case of an accidental page-refresh
- Loading a contest from a "setup" encoded string
- Floating 'Tools' button to envelope all contest-admin tools, including:
  - Cancelling a submission
  - Logging a detailed report for all submission
  - Logging the last submission's data
  - Toggling 'bling-mode' (was previously an `a href` under the scoreboard)
  - Generating/copying the contest's "setup" encoded string
  - Loading a contest from a generated string
  - Manual score retrieval/update (was previously an `a href` under the scoreboard)
- Countdown to contest start (was previously displaying timer to end time regardless 
of whether the contest started or not)
- Loading screen to show progress until the website is almost fully loaded (all ajax 
calls, documents, and elements)
  
### Changed
- Linted the entire project and made the code more consistent for better readability
- Design makeover!
  - Color palette
  - Title design
  - Font
  - Button designs
  - "Toast" style feedback
- Restructured code and split it into multiple files for better readability
- Automatic score updating interval changed from once every 10 minutes to once every 
2.5 minutes
  
### Removed
- The "Toggle fullscreen" feature that was under the scoreboard

### Fixed
- A bug that resulted in the wrong last submission to be displayed in `getLastSubmission()`
- Contest duration bug that resulted in erroneous time calculation

### Deprecated
- The fullscreen toggling method in `contest.js`


## 0.X.X

All prerelease changes are not logged







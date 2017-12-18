# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 1.5.0 - 2017-12-xx
### Added
  - Major stability improvements and better error handling
    - Error logging
    - Self-handling 429 and 503 errors by auto-retrying the requests
    - More informative feedback (previously some labels just showed 'an error occured'
    upon failure)
    - Multiple new validation layers
  - An alternative "lights on" theme that can be toggled through the tools menu
  - Expanding the tools menu will now show a hotkeys legend
  - A version label to the title that will redirect to the changelog
  - Pre-validated user handles (copied from running contests) will be skipped in the
  pre-contest validation process

### Changed
  - Minor design inconsistency in the color picker palette
  - Assigning problem colors is now optional with no forced default color
  - Ajax requests pattern for better maintainability
  - Contest table restructuring for future updates compatibility
  - Separated the scoring equation into its own `calculateScore()` method for easier customization
  - Setup screen minor design changes
  - Stylesheets restructuring and numerous improvements

### Fixed
  - Added a slight delay between ajax calls to prevent server 503/429 responses during 
  pre-contest preparations
  - Handles' insertion now validates for case-insensitive duplicates and invalid special
  characters

### Removed
  - Cross-domain support to allow error response-parsing (all JSONP requests have been changed 
  to JSON, requiring a CORS-enabled browser or an HTTP non-local server to abide by the 
  same-origin policy)


## 1.4.0 - 2017-12-13
### Added
  - Auto problem name fetching during the pre-contest preparations
  - A new `Problem Color` setup field to specify a custom color for each problem
  - More helpful hotkeys
  - Input toasts to add missing data manually when auto retrieval fails
  - All invalid user handles will sequentially trigger prompts to remove/keep them upon
  contest start
  - Invalid problem IDs will also trigger sequential prompts to remove problem/add problem name

### Changed
  - Manually retrieving scores during blind-time will now log them in the console instead
  of repopulating the contest table
  - Multiple design improvements
  - Improved variable naming for better readability

### Fixed
  - Confirmation toasts were not properly dismissed
  - A bug that caused some of the confirmation toasts' attributes to persist with other
  toasts

### Removed
  - The problem name field in the setup screen as problem names are now automatically
  obtained


## 1.3.1 - 2017-12-10
### Changed
  - Enhanced the confirmation toasts

### Fixed
  - An inconsistency resulting in not including any time modifications taking place
  during contests in the copied setup encoded string
  - Clicking the "START CONTEST" button repetitively was still causing issues due to a
  race condition
  - A bug that caused the setup screen's buttons to still be functional but invisible under
  the contest table

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


## 1.2.2 - 2017-12-04
### Fixed
  - Handles being redundantly displayed when an error occurs during verification
  - The manual score-update button spinning erroneous interruption upon hover


## 1.2.1 - 2017-12-02
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







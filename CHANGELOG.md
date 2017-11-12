# Changelog
All notable changes to this project will be documented in this file.

This project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## 1.0.1 - 2017-11-13
### Added
  - An extra button to the tools floating menu to refer to the website's documentation

### Changed
  - Some of the toasts' wording for better clarity

## 1.0.0 - 2017-11-12
### Added
- `cancelSubmission(id)`  method to rule out a submission (using its submission ID) from the scoring process
- The ability to copy the contest's "setup" (an encoded string of all handles, problems, and contest start/end time) to clipboard. This feature helps save the setup time when the same contest is supposed run on multiple computers or simply in the case of an accidental page-refresh
- Loading a contest from a "setup" encoded string
- Floating 'Tools' button to envelope all contest-admin tools, including:
  - Cancelling a submission
  - Logging a detailed report for all submission
  - Logging the last submission's data
  - Toggling 'bling-mode' (was previously an `a href` under the scoreboard)
  - Generating/copying the contest's "setup" encoded string
  - Loading a contest from a generated string
  - Manual score retrieval/update (was previously an `a href` under the scoreboard)
- Countdown to contest start (was previously displaying timer to end time regardless of whether the contest started or not)
- Loading screen to show progress until the website is almost fully loaded (all ajax calls, documents, and elements)
  
### Changed
- Linted the entire project and made the code more consistent for better readability
- Design makeover!
  - Color palette
  - Title design
  - Font
  - Button designs
  - "Toast" style feedback
- Restructured code and split it into multiple files for better readability
- Automatic score updating interval changed from once every 10 minutes to once every 2.5 minutes
  
### Removed
- The "Toggle fullscreen" feature that was under the scoreboard

### Fixed
- A bug that resulted in the wrong last submission to be displayed in `getLastSubmission()`
- Contest duration bug that resulted in erroneous time calculation

### Deprecated
- The fullscreen toggling method in `contest.js`


## 0.X.X

All prerelease changes are not logged







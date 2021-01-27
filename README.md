# CodinGame - Clash of Code enhancer userscript

Features:

* fair leaderboard points system - the verbosity of a programming language does not influence points gained in shortest mode clashes
* tournament leaderboard points persistent over multiple Clash of Code games
* color codes the vanilla leaderboard based on current game results: green for winners, yellow for 2nd position, orange for 3rd position or lower and red for 0% score, setting: enableVanillaLeaderboardStyling
* automatically shares code when clash ends, setting: automaticallyShareSolution
* when starting a new clash it closes the pop-up
* when starting a new clash it enables the automatic file sync extension: [CodinGame Sync](https://www.codingame.com/forum/t/codingame-sync-beta/614), setting: enableIdeSynchronization
* keyboard shortcuts:
    - <kbd>Ctrl</kbd> + <kbd>m</kbd> to start new tournament - resets the points
    - <kbd>Ctrl</kbd> + <kbd>i</kbd> to initiate a new clash

To use:

* install https://violentmonkey.github.io/ extension for your browser or equivalent
* load the userscript userscript.user.js in the extension: you can do that by saving the raw `userscript.user.js` to your computer and then drag and dropping it in a browser tab

To change settings edit the SETTINGS object values in the code.

Screenshots:

![](images/screenshot1.png)

---

![](images/screenshot2.png)

---

![](images/screenshot3.png)

Contributing - if you wish to contribute, here is a list of features and bug fixes that are incoming. I recomend discussing with me before working on implementing or fixing something so that we do not overlap.

Features:

* green and red arrow if someone advances in the leaderboard
* start new tournament - tournament id
* tournament id dropdown - aggregate [1..n] tournaments
* force update keyboard shortcut
* shortcut for starting new public clash
* TTS Clash starting in 15 seconds warning
* add wordwrap to the solution view!!!!!!!!!!!!!!!!!!!!!!!
* change timer color as time remaining gets lower: green to red gradient
* best highlighting/column for: 100% win streak, different language streak, etc.
* get stars for 100% score solutions
* use exponential scale for score%
* more columns to get best players based on different metrics
* update fairRank using angularjs after reloadWithDebugInfo, see: https://github.com/Azkellas/cgenhancer/issues/2#issuecomment-763527122
* convert table to use angularjs? vue?
* sort by columns (use angularjs?)
* automatic invites and twitch/discord share
* submit on all tests passed
* fix updating condition
* display tournament round
* more advanced statistics
* save all tournaments results
* vote on quality, type safety, etc.
* voting via CoC integrated chat
* easy way to view code side-by-side
* save answers locally
* remove redundancy related to selectors usage
* move css to external file: @resource
* reset local code file when starting new clash
* points explanation
* shortcut to obfuscate usernames and avatars
* cheating using: ruby -e"" should not give points
* other uses for the TTS hammer
* keyboard shortcut to focus view on leaderboard, current game results, etc.

Bugs:

* Buzzword should have 100 points this game: https://www.codingame.com/clashofcode/clash/report/155829018c2e61e45cc17c30755f83e035344a3
* less than 100% should not be colored in green: https://www.codingame.com/clashofcode/clash/report/1553675e0fa94865764d79d18d51fae0e8dc6f5
* hook into AngularJS lifecycle to do proper updates which are currently bugged and not always happening
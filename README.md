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
// ==UserScript==
// @name        Clash of Code Enhancer
// @namespace   Violentmonkey Scripts
// @match       *://www.codingame.com/*
// @grant       GM_addStyle
// @version     1.0
// @author      Răzvan Flavius Panda
// @description CodinGame Clash of Code enhancer: fair rankings, competition, ...
// @require https://raw.githubusercontent.com/lodash/lodash/4.17.15-npm/lodash.js
// ==/UserScript==
// if (location.pathname === '/multiplayer/clashofcode') {
//     let doNotReloadWithDebugInfo = 'doNotReloadWithDebugInfo';
//     if (!localStorage.getItem(doNotReloadWithDebugInfo)) {
//         localStorage.setItem(doNotReloadWithDebugInfo, 'true');
//         angular.reloadWithDebugInfo();
//     }
//     else
//     {
//         localStorage.removeItem(doNotReloadWithDebugInfo);
//     }
// }
GM_addStyle(`
    #leaderboard {
        font-family: monospace;
        margin: auto;
    }

    #leaderboard thead th {
        padding: 0 15px;
    }

    #leaderboard tbody td {
        padding: 0 15px;
    }

    #leaderboard tbody td.best-at-points {
        background-color: lightgreen;
    }

    #leaderboard tbody td.best-at-points-average {
        background-color: lightblue;
    }

    #leaderboard tbody td.best-at-games-count {
        background-color: lightseagreen;
    }

    #leaderboard tbody td.best-at-points-this-game {
        background-color: yellow;
    }

    #leaderboard tbody tr:nth-child(odd) {
        background-color: #cacbce;
    }

    #leaderboard tbody #my-tr {
        background-color: #c799f1;
    }

    #clashofcode-report .report-container {
        display: block !important;
    }

    .content-container {
        clear: both;
        margin: auto;
    }
`);
let SETTINGS = {
    enableIdeSynchronization: true,
    automaticallyShareSolution: true,
    enableVanillaLeaderboardStyling: true
};
let LOCAL_STORAGE_KEYS = {
    startNewGame: 'startNewGame'
};
(new MutationObserver(checkNewClash)).observe(document, { childList: true, subtree: true });
let $startNewPrivateClashButton = () => $('.clashofcode-privateclash .clashofcode-external-feature-link');
function checkNewClash(_changes, observer) {
    if (!_.isEmpty($startNewPrivateClashButton())) {
        observer.disconnect();
        // TODO deduplicate
        document.addEventListener("keydown", event => {
            if (event.isComposing || event.keyCode === 229) {
                return;
            }
            let languages = $("[role='presentation'] > a > cg-checkbox")
                .map(function () { return $(this).attr('label'); })
                .get();
            let enabledLanguages = $("[role='presentation'] > a > cg-checkbox > div > input")
                .map(function () { return $(this).is(":checked"); })
                .get();
            let languagesAndEnabledLanguages = _.zip(languages, enabledLanguages);
            let enableLanguages = (languagesToEnable) => {
                languagesToEnable
                    .forEach(languageToEnable => {
                    if (event.ctrlKey && event.altKey && event.key === languageToEnable[1]) {
                        languagesAndEnabledLanguages
                            .forEach(([language, enabled]) => {
                            if ((languageToEnable[0].includes(language) && !enabled)
                                ||
                                    (!languageToEnable[0].includes(language) && enabled)) {
                                $("[role='presentation'] > a > cg-checkbox")
                                    .filter(function () { return $(this).attr('label') === language; })
                                    .trigger('click');
                            }
                        });
                    }
                });
            };
            let staticallyTypedFP = ['F#', 'Haskell', 'Kotlin', 'OCaml', 'Rust', 'Scala', 'Swift'];
            let dynamicallyTyped = ['Bash', 'Clojure', 'Groovy', 'JavaScript', 'Lua', 'Perl', 'PHP', 'Python 3', 'Ruby'];
            enableLanguages([
                [[], '0'],
                [languages, '1'],
                [staticallyTypedFP, '2'],
                [dynamicallyTyped, '3']
            ]);
            // ['Bash', 'C', 'C#', 'C++', 'Clojure', 'D', 'Dart', 'F#', 'Go', 'Groovy', 'Haskell', 'Java', 'JavaScript', 'Kotlin', 'Lua', 'Objective-C', 'OCaml', 'Pascal', 'Perl', 'PHP', 'Python 3', 'Ruby', 'Rust', 'Scala', 'Swift', 'TypeScript', 'VB.NET']
        });
        if (localStorage.getItem(LOCAL_STORAGE_KEYS.startNewGame) === 'true') {
            $startNewPrivateClashButton().trigger("click");
            localStorage.removeItem(LOCAL_STORAGE_KEYS.startNewGame);
        }
    }
}
(new MutationObserver(checkIde)).observe(document, { childList: true, subtree: true });
let $gotItButton = () => $('.got-it-button');
function checkIde(_changes, observer) {
    if (!_.isEmpty($gotItButton())) {
        observer.disconnect();
        $gotItButton().trigger("click");
        if (SETTINGS.enableIdeSynchronization) {
            setTimeout(function () {
                $('.settings > .menu-entry-inner').trigger("click");
                $('[for="ide-settings-synchro-enabled"]').trigger("click");
                $('.settings > .menu-entry-inner').trigger("click");
            }, 300);
        }
        let $countdownContainer = $('.countdown-container').get(0);
        (new MutationObserver(countdown)).observe($countdownContainer, { childList: true, subtree: true });
        function countdown(_changes, observer) {
            let minutes = $('.countdown-value.minutes').text();
            let seconds = $('.countdown-value.seconds').text();
            let sayAt = (at, text) => {
                if (at === minutes + ':' + seconds) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
                }
            };
            sayAt('12:00', '12 minutes remaining');
            sayAt('10:00', '10 minutes remaining');
            sayAt('07:00', '7 minutes remaining');
            sayAt('05:00', '5 minutes remaining');
            sayAt('03:00', '3 minutes remaining');
            sayAt('01:00', '1 minute remaining');
            sayAt('00:30', '30 seconds remaining');
            sayAt('00:20', '20 seconds remaining');
            sayAt('00:15', '15 seconds remaining');
            sayAt('00:10', '10 seconds remaining');
            sayAt('00:05', '5 seconds remaining');
        }
    }
}
(new MutationObserver(check)).observe(document, { childList: true, subtree: true });
let $playerReport = () => $('.player-report');
function check(_changes, observer) {
    if (!_.isEmpty($playerReport())) {
        observer.disconnect();
        var previousFinishedCount = 0;
        update();
        setInterval(update, 3000);
        function update() {
            let $reportContainer = $(".report-container > .content-container");
            let $reports = $reportContainer.children('[ng-repeat]');
            if (_.isEmpty($reports)) {
                location.reload();
            }
            let reports = [];
            $playerReport().each((_i, obj) => {
                let timeArray = $(obj)
                    .find('div.info-clash.duration > div > div.info-content-container > div.info-value > span')
                    .text()
                    .split(':')
                    .map(s => parseInt(s));
                reports.push({
                    name: $(obj).find('.nickname').text(),
                    pending: !_.isEmpty($(obj).find('div.pending')),
                    rank: parseInt($(obj).find('.clash-rank').text()),
                    score: parseInt($(obj).find('div.info-clash.score > div > div.info-content-container > div.info-value > span').text()),
                    time: timeArray[0] * 3600 + timeArray[1] * 60 + timeArray[2],
                    length: parseInt($(obj).find('div.info-clash.criterion > div > div.info-content-container > div.info-value > span').text()),
                    language: $(obj).find('div.info-clash.language > div > div.info-content-container > div.info-value > span').text()
                });
            });
            var finishedCount = _.countBy(reports, report => !isNaN(report.score)).true;
            if (previousFinishedCount === finishedCount)
                return;
            previousFinishedCount = finishedCount;
            if (SETTINGS.automaticallyShareSolution) {
                $('.share-solution-button').trigger("click");
            }
            let reportsByLanguage = _.groupBy(reports, report => report.language);
            _.forOwn(reportsByLanguage, (reports, language) => {
                _.forEach(reports, (report, idx) => report.fairRank = language === 'N/A' ? NaN : idx + 1);
            });
            let fairReports = _.sortBy(_.flatten(_.map(reportsByLanguage, (reports, _) => reports)), report => report.rank);
            let worstRank = _.max(_.map(_.filter(fairReports, report => report.score > 0), report => report.fairRank));
            _.forEach(fairReports, report => {
                if (report.score === 0) {
                    report.fairRank = (worstRank !== null && worstRank !== void 0 ? worstRank : 0) + 1;
                }
            });
            let reportData = [];
            _(fairReports).forEach(report => {
                reportData.push(_.pick(report, 'name', 'rank', 'score', 'time', 'length', 'language'));
            });
            function getReportId() {
                return _.last(location.pathname.split('/'));
            }
            let keyPrefix = 'CoC_enhancer_';
            localStorage.setItem(keyPrefix + getReportId(), JSON.stringify(reportData));
            // TODO move outside
            document.addEventListener("keydown", event => {
                if (event.isComposing || event.keyCode === 229) {
                    return;
                }
                if (event.ctrlKey && event.key === 'm') {
                    _.forOwn(localStorage, (value, key) => {
                        if (key.startsWith(keyPrefix)) {
                            localStorage.removeItem(key);
                        }
                    });
                }
                if (event.ctrlKey && event.key === 'i') {
                    window.location.assign('https://www.codingame.com/multiplayer/clashofcode');
                    localStorage.setItem(LOCAL_STORAGE_KEYS.startNewGame, 'true'); // FIXME use proper prefix
                }
            });
            function getPoints(score, time, length, language, isShortestMode, minLengthPerLanguage, minTimePerLanguage) {
                let points = isShortestMode
                    ? (length ? score * (minLengthPerLanguage[language] / length) : 0)
                    : (score === 100 ? score * minTimePerLanguage[language] / time : score); // TODO ponder if same bug cannot happen above also
                return points * (score === 100 ? 1.5 : 1);
            }
            let leaderboard = [];
            _.forOwn(localStorage, (value, key) => {
                if (key.startsWith(keyPrefix)) {
                    let reports = JSON.parse(value);
                    let isShortestMode = _(reports).some(report => report.length);
                    let minLengthPerLanguage = _(reports)
                        .groupBy(report => report.language)
                        .mapValues(reportGroup => {
                        let maxScore = _(reportGroup)
                            .map(report => report.score)
                            .max();
                        return _(reportGroup)
                            .filter(report => report.score === maxScore)
                            .map(report => report.length)
                            .min();
                    })
                        .value();
                    let minTimePerLanguage = _(reports)
                        .groupBy(report => report.language)
                        .mapValues(reportGroup => {
                        let maxScore = _(reportGroup)
                            .map(report => report.score)
                            .max();
                        return _(reportGroup)
                            .filter(report => report.score === maxScore)
                            .map(report => report.time)
                            .min();
                    })
                        .value();
                    let maxPointsThisGame = _(reports)
                        .map(report => getPoints(report.score, report.time, report.length, report.language, isShortestMode, minLengthPerLanguage, minTimePerLanguage))
                        .max();
                    let maxScoreThisGame = _(reports).map(report => report.score).max();
                    _(reports).forEach((report) => {
                        var playerInfo = _(leaderboard).find(player => player.name === report.name);
                        let points = maxPointsThisGame === 0 ? 0 : Math.round(maxScoreThisGame * getPoints(report.score, report.time, report.length, report.language, isShortestMode, minLengthPerLanguage, minTimePerLanguage) / maxPointsThisGame);
                        let pointsTotal = points ? points : 0;
                        let isCurrentGame = key === keyPrefix + getReportId();
                        if (playerInfo) {
                            playerInfo.points += pointsTotal;
                            playerInfo.gamesCount += 1;
                            playerInfo.winStreak += report.score === 100 ? 1 : 0;
                            if (isCurrentGame) {
                                playerInfo.pointsThisGame = points;
                            }
                        }
                        else {
                            playerInfo = {
                                name: report.name,
                                gamesCount: 1,
                                points: pointsTotal ? pointsTotal : 0,
                                pointsAverage: function () { return Math.round(this.points / this.gamesCount); },
                                pointsThisGameDisplay: function () {
                                    let reportThisGame = _(fairReports).find(_ => _.name === playerInfo.name);
                                    return reportThisGame
                                        ? ((this.pointsThisGame || this.pointsThisGame === 0)
                                            ? this.pointsThisGame
                                            : "Pending...")
                                        : "N/A";
                                },
                                winStreak: report.score === 100 ? 1 : 0,
                                languageStreak: pointsTotal === 100 ? 1 : 0
                            };
                            if (isCurrentGame) {
                                playerInfo.pointsThisGame = points;
                            }
                            leaderboard.push(playerInfo);
                        }
                    });
                }
                ;
            });
            $('#leaderboard').remove();
            var table = `<table id='leaderboard'>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Name</th>
                            <th>Points total</th>
                            <th>Points average per game</th>
                            <th>Games</th>
                            <th>Points this game</th>
                            <th>Win streak</th>
                        </tr>
                    </thead>
                    <tbody>`;
            let playerName = $('.my-background .nickname').text();
            let maxPoints = _(leaderboard).map(_ => _.points).max();
            let maxPointsAverage = _(leaderboard).map(_ => _.pointsAverage()).max();
            let maxGamesCount = _(leaderboard).map(_ => _.gamesCount).max();
            let maxPointsThisGame = _(leaderboard)
                .map(_ => typeof _.pointsThisGameDisplay() == 'number' ? _.pointsThisGameDisplay() : 0)
                .max();
            _(leaderboard)
                .sortBy(_ => _.points)
                .reverse()
                .forEach((playerInfo, index) => {
                let attr = playerInfo.name === playerName ? ' id="my-tr"' : '';
                let bestAtPoints = playerInfo.points === maxPoints ? ' class="best-at-points"' : '';
                let bestAtPointsAverage = playerInfo.pointsAverage() === maxPointsAverage ? ' class="best-at-points-average"' : '';
                let bestAtGamesCount = playerInfo.gamesCount === maxGamesCount ? ' class="best-at-games-count"' : '';
                let bestAtPointsThisGame = playerInfo.pointsThisGameDisplay() === maxPointsThisGame ? ' class="best-at-points-this-game"' : '';
                table +=
                    '<tr' + attr + '><td>' + (index + 1) + '</td>' +
                        '<td>' + playerInfo.name + '</td>' +
                        '<td' + bestAtPoints + '>' + playerInfo.points + '</td>' +
                        '<td' + bestAtPointsAverage + '>' + playerInfo.pointsAverage() + '</td>' +
                        '<td' + bestAtGamesCount + '>' + playerInfo.gamesCount + '</td>' +
                        '<td' + bestAtPointsThisGame + '>' + playerInfo.pointsThisGameDisplay() + '</td>' +
                        '<td>' + playerInfo.winStreak + '</td>' +
                        '</tr>';
            });
            table += "</tbody></table>";
            // TODO position / game
            let $leaderboard = $('<div>').append(table);
            $reportContainer.prepend($leaderboard);
            $reports.each((index, obj) => {
                let fairReport = fairReports[index];
                $(obj).find('.clash-rank').text(fairReport.fairRank);
                if (SETTINGS.enableVanillaLeaderboardStyling) {
                    if ($(obj).attr('class') === 'my-background') {
                        $(obj)
                            .find('div.clash-rank')
                            .css('background-color', 'blueviolet');
                    }
                    if (fairReport.score < 100 && fairReport.fairRank === 1) {
                        bgColor = 'yellowgreen';
                    }
                    else if (fairReport.score > 0) {
                        var bgColor;
                        switch (fairReport.fairRank) {
                            case 1:
                                bgColor = 'mediumseagreen';
                                break;
                            case 2:
                                bgColor = 'yellow';
                                break;
                            default: bgColor = 'orange';
                        }
                    }
                    else if (isNaN(fairReport.score)) {
                        bgColor = 'transparent';
                    }
                    else {
                        bgColor = 'indianred';
                    }
                    $(obj).css('background-color', bgColor);
                    $(obj)
                        .find('button')
                        .css('background-color', '#e7e9eb');
                }
            });
            // FIXME sortBy: fairRank -> score -> time 
            // $reportContainer
            //     .children('.header-result')
            //     .after(
            //         _($reports.detach())
            //             .sortBy($report => parseInt($($report).find('.clash-rank').text()))
            //             .value()
            //     );
        }
    }
}
//# sourceMappingURL=userscript.user.js.map
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
// TODO features / improvements:
// * add keyboard shortcuts to change between enabled languages sets
// * 100% score should give much more points, maybe use exponential scale for score
// * force update keyboard shortcut
// * points should depend when short mode based on language / length
// * fix leaderboard point related bugs
// * automatic invites and twitch/discord share
// * submit on all tests passed
// * fix updating condition
// * text to speech for timer
// * display tournament round
// * start new tournament - tournament id
// * tournament id dropdown - aggregate [1..n] tournaments
// * green and red arrow if someone advances in the leaderboard
// * more advanced statistics
// * save all tournaments results
// * convert table to use angularjs? vue?
// * sort by columns (use angularjs?)
// * vote on quality, type safety, etc.
// * voting via CoC integrated chat
// * easy way to view code side-by-side
// * save answers locally
// * remove redundancy related to selectors usage
// * move css to external file: @resource
// * reset local code file when starting new clash
// * points explanation
// * shortcut to obfuscate usernames and avatars
// * cheating using: ruby -e"" should not give points
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
    automaticallyShareSolution: true
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
            if (event.ctrlKey && event.key === '0') {
                $("[role='presentation'] > a").trigger("click");
            }
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
            function getPoints(score, time, length, language, isShortestMode, minLengthPerLanguage) {
                let points = isShortestMode ? score * (minLengthPerLanguage[language] / length) : score / time;
                return 100 * points;
            }
            let leaderboard = [];
            _.forOwn(localStorage, (value, key) => {
                if (key.startsWith(keyPrefix)) {
                    let reports = JSON.parse(value);
                    let isShortestMode = _(reports).some(report => report.length);
                    let minLengthPerLanguage = _(reports)
                        .groupBy(report => report.language)
                        .mapValues(reportGroup => _(reportGroup).map(report => report.length).min())
                        .value();
                    let maxPointsThisGame = _(reports)
                        .map(report => getPoints(report.score, report.time, report.length, report.language, isShortestMode, minLengthPerLanguage))
                        .max();
                    _(reports).forEach((report) => {
                        var playerInfo = _(leaderboard).find(player => player.name === report.name);
                        let points = Math.round(100 * getPoints(report.score, report.time, report.length, report.language, isShortestMode, minLengthPerLanguage) / maxPointsThisGame);
                        let isCurrentGame = key === keyPrefix + getReportId();
                        let pointsTotal = points ? points : 0;
                        let pointsThisGame = points === 0 ? 0 : points ? points : 'Pending...';
                        if (playerInfo) {
                            playerInfo.points += pointsTotal;
                            playerInfo.gamesCount += 1;
                            if (isCurrentGame) {
                                playerInfo.pointsThisGame = pointsThisGame;
                            }
                        }
                        else {
                            playerInfo = {
                                name: report.name,
                                gamesCount: 1,
                                points: pointsTotal ? pointsTotal : 0
                            };
                            if (isCurrentGame) {
                                playerInfo.pointsThisGame = pointsThisGame;
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
                            <th>Points this game</th>
                            <th>Points average per game</th>
                            <th>Games</th>
                        </tr>
                    </thead>
                    <tbody>`;
            let playerName = $('.my-background .nickname').text();
            _(leaderboard)
                .sortBy(_ => _.points)
                .reverse()
                .forEach((playerInfo, index) => {
                let hasReportThisGame = _(fairReports).find(_ => _.name === playerInfo.name);
                let attr = playerInfo.name === playerName ? ' id="my-tr"' : '';
                table += '<tr' + attr + '><td>' + (index + 1) + '</td><td>'
                    + playerInfo.name + '</td><td>'
                    + playerInfo.points + '</td><td>'
                    + (hasReportThisGame ? (isNaN(playerInfo.pointsThisGame) ? "Pending..." : playerInfo.pointsThisGame) : "N/A") + '</td><td>'
                    + Math.round(playerInfo.points / playerInfo.gamesCount) + '</td><td>'
                    + playerInfo.gamesCount + '</td>';
            });
            table += "</tbody></table>";
            // TODO position / game
            let $leaderboard = $('<div>').append(table);
            $reportContainer.prepend($leaderboard);
            $reports.each((index, obj) => {
                let fairReport = fairReports[index];
                $(obj).find('.clash-rank').text(fairReport.fairRank);
                // TODO to style tag
                if ($(obj).attr('class') === 'my-background') {
                    $(obj)
                        .find('div.clash-rank')
                        .css('background-color', 'blueviolet');
                }
                if (fairReport.score > 0) {
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
// ==UserScript==
// @name        Clash of Code Enhancer
// @namespace   Violentmonkey Scripts
// @match       *://www.codingame.com/*
// @grant       none
// @version     1.0
// @author      -
// @description 3/8/2020, 8:42:28 PM
// @require https://raw.githubusercontent.com/lodash/lodash/4.17.15-npm/lodash.js
// ==/UserScript==
// TODO:
// * automatically start sync on new clash + click on start clash button
// * css for winners
// * improve overall design
// * easy way to view code side-by-side
// * save answers locally
(new MutationObserver(check)).observe(document, { childList: true, subtree: true });
function check(_changes, observer) {
    if (document.querySelector('.player-report')) {
        observer.disconnect();
        var previousFinishedCount = 0;
        update();
        setInterval(update, 3000);
        function update() {
            var reports = [];
            $('.player-report').each(function (_i, obj) {
                reports.push({
                    rank: parseInt($(obj).find('.clash-rank').text()),
                    score: parseInt($(obj).find('div.info-clash.score > div > div.info-content-container > div.info-value > span').text()),
                    pending: _.isEmpty($(obj).find('.pending-rank')),
                    nickname: $(obj).find('.nickname').text(),
                    language: $(obj).find('div.info-clash.language > div > div.info-content-container > div.info-value > span').text()
                });
            });
            var finishedCount = _.countBy(reports, function (report) { return !isNaN(report.score); }).true;
            if (previousFinishedCount === finishedCount)
                return;
            previousFinishedCount = finishedCount;
            var isShortestMode = $('div.clash-info-container > div > div.info-clash.criterion > div > div.info-content-container > div.info-label > span').first().text() === 'CHARACTERS';
            if (isShortestMode) {
                var reportsByLanguage = _.groupBy(reports, function (report) { return report.language; });
                _.forOwn(reportsByLanguage, function (reports, language) {
                    _.forEach(reports, function (report, idx) { return report.fairRank = language === 'N/A' ? NaN : idx + 1; });
                });
                var fairReports_1 = _.sortBy(_.flatten(_.map(reportsByLanguage, function (reports, _) { return reports; })), function (report) { return report.rank; });
                var worstRank_1 = _.max(_.map(_.filter(fairReports_1, function (report) { return report.score > 0; }), function (report) { return report.fairRank; }));
                _.forEach(fairReports_1, function (report) {
                    if (report.score === 0) {
                        report.fairRank = worstRank_1 + 1;
                    }
                });
                var $reportContainer = $(".report-container > .content-container");
                var $reports = $reportContainer.children('[ng-repeat]');
                $reports.each(function (index, obj) {
                    var fairReport = fairReports_1[index];
                    $(obj).find('.clash-rank').text(fairReport.fairRank);
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
                $reportContainer
                    .children('.header-result')
                    .after(_.sortBy($reports.detach(), function ($report) { return Math.random() + parseInt($($report).find('.clash-rank').text()); }));
            }
        }
    }
}
//# sourceMappingURL=userscript.user.js.map
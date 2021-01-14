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
// * automatic invites and twitch/discord share
// * css for winners
// * improve overall design
// * easy way to view code side-by-side
// * save answers locally
// * competition features

(new MutationObserver(check)).observe(document, {childList: true, subtree: true});

function check(_changes, observer) {
    if(document.querySelector('.player-report')) {
        observer.disconnect();

        var previousFinishedCount = 0;
        update();
        setInterval(update, 3000);

        function update() {
            let reports = [];
            $('.player-report').each((_i, obj) =>
            {
                reports.push({
                    rank:  parseInt($(obj).find('.clash-rank').text()),
                    score: parseInt($(obj).find('div.info-clash.score > div > div.info-content-container > div.info-value > span').text()),
                    pending: _.isEmpty($(obj).find('.pending-rank')),
                    nickname: $(obj).find('.nickname').text(),
                    language: $(obj).find('div.info-clash.language > div > div.info-content-container > div.info-value > span').text()
                });
            });

            var finishedCount = _.countBy(reports, report => !isNaN(report.score)).true;
            if (previousFinishedCount === finishedCount) return;
            previousFinishedCount = finishedCount;
    
            let isShortestMode = $('div.clash-info-container > div > div.info-clash.criterion > div > div.info-content-container > div.info-label > span').first().text() === 'CHARACTERS';
    
            let reportsByLanguage = _.groupBy(reports, report => report.language);
            _.forOwn(reportsByLanguage, (reports, language) => {
                _.forEach(reports, (report, idx) => report.fairRank = language === 'N/A' ? NaN : idx + 1);
            })

            let fairReports =
                _.sortBy(_.flatten(_.map(reportsByLanguage, (reports, _) => reports)), report => report.rank);

            let worstRank = _.max(_.map(_.filter(fairReports, report => report.score > 0), report => report.fairRank));
            _.forEach(fairReports, report =>{
                if (report.score === 0){
                    report.fairRank = worstRank + 1
                }
            });

            var $reportContainer = $(".report-container > .content-container");
            var $reports = $reportContainer.children('[ng-repeat]');
            $reports.each((index, obj) =>
            {
                let fairReport = fairReports[index];
                $(obj).find('.clash-rank').text(fairReport.fairRank);

                if ($(obj).attr('class') === 'my-background') {
                    $(obj)
                        .find('div.clash-rank')
                        .css('background-color', 'blueviolet');             
                }

                if (fairReport.score > 0){
                    var bgColor;
                    switch (fairReport.fairRank) {
                        case 1: bgColor = 'mediumseagreen'; break;
                        case 2: bgColor = 'yellow'; break;
                        default: bgColor = 'orange';
                    }
                }
                else if (isNaN(fairReport.score))
                {
                    bgColor = 'transparent';
                }
                else
                {
                    bgColor = 'indianred';
                }

                $(obj).css('background-color', bgColor);
                $(obj)
                    .find('button')
                    .css('background-color', '#e7e9eb');
            })

            $reportContainer
                .children('.header-result')
                .after(_.sortBy($reports.detach(),
                    $report => Math.random() + parseInt($($report).find('.clash-rank').text())));
        }
    }
}
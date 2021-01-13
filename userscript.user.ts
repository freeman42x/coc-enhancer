// ==UserScript==
// @name        Clash of Code Enhancer
// @namespace   Violentmonkey Scripts
// @match       *://www.codingame.com/clashofcode/clash/report/*
// @grant       none
// @version     1.0
// @author      -
// @description 3/8/2020, 8:42:28 PM
// @require https://cdnjs.cloudflare.com/ajax/libs/ramda/0.27.1/ramda.min.js
// @require https://raw.githubusercontent.com/lodash/lodash/4.17.15-npm/core.js
// ==/UserScript==

(new MutationObserver(check)).observe(document, {childList: true, subtree: true});

function check(_changes, observer) {
    if(document.querySelector('.player-report')) {
        observer.disconnect();
        let reports = [];
        $('.player-report').each((_, obj) =>
        {
            reports.push({
                rank:  parseInt($(obj).find('.clash-rank').text()),
                score: parseInt($(obj).find('div.info-clash.score > div > div.info-content-container > div.info-value > span').text()),
                nickname: $(obj).find('.nickname').text(),
                language: $(obj).find('div.info-clash.language > div > div.info-content-container > div.info-value > span').text()
            });
        });

        let isShortestMode = $('div.clash-info-container > div > div.info-clash.criterion > div > div.info-content-container > div.info-label > span').first().text() === 'CHARACTERS';

        if (isShortestMode){
            let reportsByLanguage = R.groupBy<any>(report => report.language)(reports);
            R.forEachObjIndexed((reports, _language) => {
                R.addIndex<any>(R.forEach)((report, idx) => report.fairRank = idx + 1, reports);
            }, reportsByLanguage)

            let fairReports =
                _.sortBy(_.flatten(_.map(reportsByLanguage, (reports, _) => reports)), report => report.rank);

            let worstRank = _.max(_.map(fairReports, report => report.fairRank));
            _.forEach(fairReports, report =>{
                if (report.score === 0){
                    report.fairRank = worstRank + 1
                }
            });

            $('.clash-rank').each((index, obj) =>
            {
                let fairReport = fairReports[index];
                $(obj).text(fairReport.fairRank);
                if (fairReport.score > 0){
                    var bgColor;
                    switch (fairReport.fairRank) {
                        case 1: bgColor = 'mediumseagreen'; break;
                        case 2: bgColor = 'yellow'; break;
                        default: bgColor = 'orange';
                    }
                }
                else
                {
                    bgColor = 'indianred'
                }

                $(obj)
                    .parents("[ng-repeat='player in clashOfCodeService.currentReport.players']")
                    .css('background-color', bgColor);
            })
        }
    }
}
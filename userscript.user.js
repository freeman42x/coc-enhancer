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
(new MutationObserver(check)).observe(document, { childList: true, subtree: true });
function check(_changes, observer) {
    if (document.querySelector('.player-report')) {
        observer.disconnect();
        var reports_1 = [];
        $('.player-report').each(function (_, obj) {
            reports_1.push({
                rank: parseInt($(obj).find('.clash-rank').text()),
                nickname: $(obj).find('.nickname').text(),
                language: $(obj).find('div.info-clash.language > div > div.info-content-container > div.info-value > span').text()
            });
        });
        var isShortestMode = $('div.clash-info-container > div > div.info-clash.criterion > div > div.info-content-container > div.info-label > span').first().text() === 'CHARACTERS';
        if (isShortestMode) {
            var reportsByLanguage = R.groupBy(function (report) { return report.language; })(reports_1);
            R.forEachObjIndexed(function (reports, _language) {
                R.addIndex(R.forEach)(function (report, idx) { return report.fairRank = ++idx; }, reports);
            }, reportsByLanguage);
            var fairReports_1 = _.sortBy(_.flatten(_.map(reportsByLanguage, function (reports, _) { return reports; })), function (report) { return report.rank; });
            $('.clash-rank').each(function (index, obj) {
                var rank = fairReports_1[index].fairRank;
                $(obj).text(rank);
                if (rank === 1) {
                    $(obj)
                        .parents("[ng-repeat='player in clashOfCodeService.currentReport.players']")
                        .css('background-color', 'mediumseagreen');
                }
            });
        }
    }
}
//# sourceMappingURL=userscript.user.js.map
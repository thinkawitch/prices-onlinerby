// ==UserScript==
// @name        Prices in USD for onliner.by
// @namespace   name.sinkevitch.andrew
// @version     1.1.1
// @include     http://ab.onliner.by/*
// @include     http://mb.onliner.by/*
// @include     http://baraholka.onliner.by/*
// @include     http://catalog.onliner.by/*
// @author      Andrew Sinkevitch
// @description Add prices in USD
// @grant       none
// ==/UserScript==


(function (window, undefined) {
    var w;
    if (typeof unsafeWindow != undefined) {
        w = unsafeWindow
    } else {
        w = window;
    }

    if (w.self != w.top) {
        return;
    }

    function pricesOnliner()
    {
        function addGlobalStyle(css) {
            var head, style;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = css;
            head.appendChild(style);
        }

        var css = '\
            .hk-usd { color:#5a9300; font-weight:bold; font-family:Arial,Helvetica; } \
            .adverts-table .cost .hk-usd { margin:5px 0 0 0; font-size:16px; } \
            .autoba-hd-details .hk-usd { margin:3px 0 0 10px; font-size:18px; } \
            .ba-tbl-list__table .cost .hk-usd { margin:5px 0 0 0; font-size:1em; } \
            .b-ba-topicdet .hk-usd { margin:3px 0 0 10px; font-size:18px; } \
            .poffers .hk-usd { margin:3px 0 5px 0; font-size:13px; } \
            .pgdescr .hk-usd { font-family: Verdana,​Geneva,​Arial,​Helvetica,​sans-serif; } \
            .b-offers-desc__info-price .hk-usd { margin:0 0 20px 0; } \
        ';
        addGlobalStyle(css);

        var hkUsd = 15500;
        var hkCentsLimit = 500;

        function hkGetIntegerNumber(str, separator)
        {
            separator = separator || '.';
            str = str.replace(/руб./g, '');

            if (separator == '.')
            {
                str = str.replace(/[^0-9.\-]/g, '');
            }
            else
            {
                str = str.replace(/[^0-9,\-]/g, '');
                str = str.replace(',', '.');
            }

            return parseInt(str);
        }

        function hkRound(number, decimal_points)
        {
            if(!decimal_points) return Math.round(number);
            if(number == 0) {
                var decimals = "";
                for(var i=0;i<decimal_points;i++) decimals += "0";
                return "0."+decimals;
            }
            var exponent = Math.pow(10,decimal_points);
            var num = Math.round((number * exponent)).toString();

            var numSlice = num.slice(0,-1*decimal_points);
            if (numSlice == "") numSlice = 0;
            
            return numSlice + "." + num.slice(-1*decimal_points);
        }

        function hkFormat(number)
        {
            return String(number).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
        }

        function hkGetFormattedUsdPrice(rub)
        {
            var usd = rub / hkUsd;
            var round = (usd >= hkCentsLimit) ? 0 : 2;
            usd = hkRound(usd, round);
            return hkFormat(usd);
        }

        function hkDetectUsd()
        {
            var usd = $('.top-informer-currency span').text();
            usd = hkGetIntegerNumber(usd);
            if (usd > 10000) hkUsd = usd;
        }

        function hkUpdateTablePricesInAB()
        {
            $('.adverts-table .cost').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).find('.cost-i strong').text();
                rub = hkGetIntegerNumber(rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdatePriceSelectInAB()
        {
            $('.autoba-filters-single select[name="min-price"] option, .autoba-filters-single select[name="max-price"] option').each(function(idx, el)
            {
                var rub = parseInt(el.value);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).text($(this).text() + ' ($ ' + usd + ')');
            });
        }

        function hkUpdateAdvertPriceInAB()
        {
            var rub = $('.autoba-hd-details .cost strong').first().text();
            rub = hkGetIntegerNumber(rub);
            if (isNaN(rub)) return;

            var usd = hkGetFormattedUsdPrice(rub);
            $('.autoba-hd-details').append('<div class="hk-usd">$ ' + usd + '</div>');
        }


        function hkUpdateTablePricesInBaraholka()
        {
            $('.ba-tbl-list__table .cost').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var rub = $(el).find('big strong').text();
                rub = hkGetIntegerNumber(rub);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInBaraholka()
        {
            var rub = $('.b-ba-topicdet .cost').first().text();
            rub = hkGetIntegerNumber(rub);
            if (isNaN(rub)) return;

            var usd = hkGetFormattedUsdPrice(rub);
            $('.b-ba-topicdet').append('<div class="hk-usd">$ ' + usd + '</div>');
        }

        function hkAddRangePriceCatalog(selRub)
        {
            var line = selRub.text();
            var parts = line.split(/[–-]/);
            if (parts.length > 1)
            {
                var rub1 = hkGetIntegerNumber(parts[0]);
                var rub2 = hkGetIntegerNumber(parts[1]);
                if (isNaN(rub1) || isNaN(rub2)) return;

                var usd1 = hkGetFormattedUsdPrice(rub1);
                var usd2 = hkGetFormattedUsdPrice(rub2);
                selRub.after('<div class="hk-usd">$ ' + usd1 + ' - $ ' + usd2 + '</div>');
            }
            else
            {
                var rub = hkGetIntegerNumber(line);
                if (isNaN(rub)) return;

                var usd = hkGetFormattedUsdPrice(rub);
                selRub.after('<div class="hk-usd">$ ' + usd + '</div>');
            }
        }

        function hkUpdateTablePricesInCatalog()
        {
            //list
            $('td.poffers').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var selRub = $(el).find('.pprice_byr');
                hkAddRangePriceCatalog(selRub);
            });

            //gallery
            $('td.pgdescr').each(function(idx, el)
            {
                var selUsd = $(el).find('.hk-usd');
                if (selUsd.length > 0) return;

                var selRub = $(el).find('.pgprice a');
                hkAddRangePriceCatalog(selRub);
            });
        }

        function hkUpdateAdvertPriceInCatalog()
        {
            var selRub = $('.b-offers-desc__info-sub a').first();
            hkAddRangePriceCatalog(selRub);
        }

        setTimeout(function(){

            hkDetectUsd();
            //console.log('detected usd', hkUsd);

            hkUpdateAdvertPriceInAB();
            setInterval(hkUpdateTablePricesInAB, 3000);
            hkUpdatePriceSelectInAB();

            hkUpdateAdvertPriceInBaraholka();
            hkUpdateTablePricesInBaraholka();

            hkUpdateTablePricesInCatalog();
            hkUpdateAdvertPriceInCatalog();

        }, 1000);


    }

    var execute = function (body) {
        if (typeof body === "function") { body = "(" + body + ")();"; }
        var el = document.createElement("script");
        el.textContent = body;
        document.body.appendChild(el);
        return el;
    };

    execute(pricesOnliner);

})(window);

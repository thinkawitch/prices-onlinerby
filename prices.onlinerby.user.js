// ==UserScript==
// @name        Prices in USD for onliner.by
// @namespace   name.sinkevitch.andrew
// @version     1.0
// @include     http://ab.onliner.by/*
// @include     http://mb.onliner.by/*
// @include     http://baraholka.onliner.by/*
// @author      Andrew Sinkevitch
// @description Add prices in USD
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

        addGlobalStyle('.adverts-table .cost .hk-usd { margin:5px 0 0 0; color:#5a9300; font-weight:bold; font-size:16px; font-family:Arial,Helvetica; }');
        addGlobalStyle('.autoba-hd-details .hk-usd { margin:3px 0 0 10px; color:#5a9300; font-weight:bold; font-size:18px; font-family:Arial,Helvetica; }');

        addGlobalStyle('.ba-tbl-list__table .cost .hk-usd { margin:5px 0 0 0; color:#5a9300; font-weight:bold; font-size:1em; font-family:Arial,Helvetica; }');
        addGlobalStyle('.b-ba-topicdet .hk-usd { margin:3px 0 0 10px; color:#5a9300; font-weight:bold; font-size:18px; font-family:Arial,Helvetica; }');

        var hkUsd = 15000;

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
            return num.slice(0,-1*decimal_points) + "." + num.slice(-1*decimal_points)
        }


        function hkDetectUsd()
        {
            var usd = $('.top-informer-currency span').text();
            usd = hkGetIntegerNumber(usd);
            window.console.log('detected usd', usd);
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

                var usd = hkRound(rub / hkUsd, 2);
                //window.console.log('rub', rub, 'usd', usd);

                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInAB()
        {
            var rub = $('.autoba-hd-details .cost strong').first().text();
            rub = hkGetIntegerNumber(rub);
            if (isNaN(rub)) return;

            var usd = hkRound(rub / hkUsd, 2);
            //window.console.log('rub', rub, 'usd', usd);
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

                var usd = hkRound(rub / hkUsd, 2);
                //window.console.log('rub', rub, 'usd', usd);

                $(el).append('<div class="hk-usd">$ ' + usd + '</div>');
            });
        }

        function hkUpdateAdvertPriceInBaraholka()
        {
            var rub = $('.b-ba-topicdet .cost').first().text();
            rub = hkGetIntegerNumber(rub);
            if (isNaN(rub)) return;

            var usd = hkRound(rub / hkUsd, 2);
            //window.console.log('rub', rub, 'usd', usd);
            $('.b-ba-topicdet').append('<div class="hk-usd">$ ' + usd + '</div>');
        }

        // add prices
        hkDetectUsd();

        hkUpdateAdvertPriceInAB();
        setInterval(hkUpdateTablePricesInAB, 4000);

        hkUpdateAdvertPriceInBaraholka();
        hkUpdateTablePricesInBaraholka();
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
String.prototype.lpad = function(
    pad
    )
{
    return pad.substring(this.length) + this;
};

Date.dayKeys =
    [
        'sun',
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat'
    ];

Date.maxYear = 9999;

var dateFieldSymbols;
var parseDate;
var parseUTCDate;
var formatDate;
var formatUTCDate;
(function()
{
    var calendar = Date.calendar;

    var monthKeys =
        [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12'
        ];

    function monthSymbol(
        names
        )
    {
        this.field = 'month';
        this.format = function(
            month
            )
        {
            return names[month];
        };
        this.regex = '(' +
            monthKeys.map(
                function(
                    monthKey
                    )
                {
                    return names[monthKey];
                }).join('|') + ')';
        this.convert = function(
                value
                )
        {
            value = value.toLowerCase();
            for(var month = 1;month <= 12;++month)
                if(names[month].toLowerCase() == value)
                    return month;
        };
    }

    function daySymbol(
        names
        )
    {
        this.field = 'week day';
        this.format = function(
            weekDay
            )
        {
            return names[Date.dayKeys[weekDay]];
        };
    }

    dateFieldSymbols =
    {
        y:
        {
            field: 'year',
            format: function(year) { return year.toString(); },
            regex: '(\\d{1,})',
            convert: Number
        },
        yy:
        {
            field: 'year',
            format: function(year) { return (year % 100).toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: function(value) { return Number(value) + Math.floor(new Date().getFullYear() / 100) * 100; }
        },
        yyyy:
        {
            field: 'year',
            format: function(year) { return year.toString().lpad('0000'); },
            regex: '(\\d{4,})',
            convert: Number
        },
        M:
        {
            field: 'month',
            format: function(month) { return month.toString(); },
            regex: '(\\d{1,2})',
            convert: Number
        },
        MM:
        {
            field: 'month',
            format: function(month) { return month.toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: Number
        },
        MMM: new monthSymbol(calendar.months.format.abbreviated),
        MMMM: new monthSymbol(calendar.months.format.wide),
        MMMMM: new monthSymbol(calendar.months.format.narrow),
        L:
        {
            field: 'month',
            format: function(month) { return month.toString(); },
            regex: '(\\d{1,2})',
            convert: Number
        },
        LL:
        {
            field: 'month',
            format: function(month) { return month.toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: Number
        },
        LLL: new monthSymbol(calendar.months['stand-alone'].abbreviated),
        LLLL: new monthSymbol(calendar.months['stand-alone'].wide),
        LLLLL: new monthSymbol(calendar.months['stand-alone'].narrow),
        d:
        {
            field: 'day',
            format: function(day) { return day.toString(); },
            regex: '(\\d{1,2})',
            convert: Number
        },
        dd:
        {
            field: 'day',
            format: function(day) { return day.toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: Number
        },
        EEE: new daySymbol(calendar.days.format.abbreviated),
        EEEE: new daySymbol(calendar.days.format.wide),
        EEEEE: new daySymbol(calendar.days.format.narrow),
        EEEEEE: new daySymbol(calendar.days.format.short),
        H:
        {
            field: 'hour',
            format: function(hour) { return hour.toString(); },
            regex: '(\\d{1,2})',
            convert: Number
        },
        HH:
        {
            field: 'hour',
            format: function(hour) { return hour.toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: Number
        },
        m:
        {
            field: 'minute',
            format: function(minute) { return minute.toString(); },
            regex: '(\\d{1,2})',
            convert: Number
        },
        mm:
        {
            field: 'minute',
            format: function(minute) { return minute.toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: Number
        },
        s:
        {
            field: 'second',
            format: function(second) { return second.toString(); },
            regex: '(\\d{1,2})',
            convert: Number
        },
        ss:
        {
            field: 'second',
            format: function(second) { return second.toString().lpad('00'); },
            regex: '(\\d{2})',
            convert: Number
        },
        SSS:
        {
            field: 'millisecond',
            format: function(millisecond) { return millisecond.toString().lpad('000'); },
            regex: '(\\d{3})',
            convert: Number
        },
        xx:
        {
            field: 'zone',
            format: function(
                zone,
                separator
                )
            {
                var absZone = Math.abs(zone);
                return (zone >= 0 ? '+' : '-') +
                    Math.floor(absZone / 60).toString().lpad('00') +
                    (separator ? separator : '') +
                    (absZone % 60).toString().lpad('00')
            },
            regex: '((\\+|\\-)(\\d{2})(\\d{2}))',
            convert: function(
                value,
                matches
                )
            {
                var positive = matches.shift() === '+';
                var minutes = Number(matches.shift()) * 60 + Number(matches.shift());
                return positive ? minutes : -minutes;
            }
        },
        xxx:
        {
            field: 'zone',
            format: function(
                zone
                )
            {
                return dateFieldSymbols.xx.format(zone, ':');
            },
            regex: '((\\+|\\-)(\\d{2}):(\\d{2}))',
            convert: function(
                value,
                matches
                )
            {
                return dateFieldSymbols.xx.convert(
                    value,
                    matches);
            }
        },
        XX:
        {
            field: 'zone',
            format: function(
                zone
                )
            {
                return zone === 0 ? 'Z' : dateFieldSymbols.xx.format(zone);
            },
            regex: '((\\+|\\-)(\\d{2})(\\d{2})|Z)',
            convert: function(
                value,
                matches
                )
            {
                return value === 'Z' ? 0 : dateFieldSymbols.xx.convert(
                    value,
                    matches);
            }
        },
        XXX:
        {
            field: 'zone',
            format: function(
                zone
                )
            {
                return zone === 0 ? 'Z' : dateFieldSymbols.xxx.format(zone);
            },
            regex: '((\\+|\\-)(\\d{2}):(\\d{2})|Z)',
            convert: function(
                value,
                matches
                )
            {
                return dateFieldSymbols.XX.convert(
                    value,
                    matches);
            }
        }
    };

    var escapeSymbol = "'";
    var escapedEscapeSymbol = escapeSymbol + escapeSymbol;

    dateFieldSymbols[escapeSymbol       ] = {};
    dateFieldSymbols[escapedEscapeSymbol] = {};

    function escape(
        f
        )
    {
        var escaping = false;

        return function(
            symbol
            )
        {
            if(symbol === escapeSymbol)
            {
                escaping = !escaping;
                return '';
            }

            if(symbol === escapedEscapeSymbol)
                return escapeSymbol;

            return escaping ? symbol : f(symbol);
        };
    }

    var symbols = [];

    for(var symbol in dateFieldSymbols)
        symbols.push(symbol);

    symbols.sort(
        function(
            x,
            y
            )
        {
            if(x.length > y.length)
                return -1;

            else if(x.length < y.length)
                return 1;

            return 0;
        });

    var symbolRegex = new RegExp(
        '(' + symbols.join('|') + ')',
        'g');

    (function()
    {
        function getDateComponents(
            date
            )
        {
            return {
                year       :  date.getFullYear(),
                month      :  date.getMonth() + 1,
                day        :  date.getDate(),
                'week day' :  date.getDay(),
                hour       :  date.getHours(),
                minute     :  date.getMinutes(),
                second     :  date.getSeconds(),
                millisecond:  date.getMilliseconds(),
                zone       : -date.getTimezoneOffset()
            };
        };

        function getUTCDateComponents(
            date
            )
        {
            return {
                year       : date.getUTCFullYear(),
                month      : date.getUTCMonth() + 1,
                day        : date.getUTCDate(),
                'week day' : date.getUTCDay(),
                hour       : date.getUTCHours(),
                minute     : date.getUTCMinutes(),
                second     : date.getUTCSeconds(),
                millisecond: date.getUTCMilliseconds(),
                zone       : 0
            };
        };

        function buildFormatDate(
            getDateComponents
            )
        {
            return function(
                dateFormatPattern,
                date
                )
            {
                function format(
                    date
                    )
                {
                    var dateComponents = getDateComponents(date);
                    return dateFormatPattern.replace(
                        symbolRegex,
                        escape(
                            function(
                                symbol
                                )
                            {
                                var symbolObject = dateFieldSymbols[symbol];
                                return symbolObject.format(dateComponents[symbolObject.field]);
                        }));
                }

                return typeof date == 'undefined' ? format : format(date);
            };
        }

        formatDate    = buildFormatDate(getDateComponents   );
        formatUTCDate = buildFormatDate(getUTCDateComponents);
        Date.prototype.formatDate = function(
            dateFormatPattern
            )
        {
            return formatDate(
                dateFormatPattern,
                this);
        };
        Date.prototype.formatUTCDate = function(
            dateFormatPattern
            )
        {
            return formatUTCDate(
                dateFormatPattern,
                this);
        };
    })();

    (function()
    {
        function buildDate(
            dateComponents
            )
        {
            // Do not use Date constructor because:
            // If y is not NaN and 0 <= ToInteger(y) <= 99, then let yr be 1900+ToInteger(y); otherwise, let yr be y.
            var date = new Date(0);
            date.setFullYear(
                dateComponents.year,
                dateComponents.month - 1,
                dateComponents.day);

            date.setHours(
                dateComponents.hour,
                dateComponents.minute,
                dateComponents.second,
                dateComponents.millisecond);

            if(typeof dateComponents.zone == 'number')
                date = new Date(date.valueOf() - (dateComponents.zone + date.getTimezoneOffset()) * 60 * 1000);

            return date;
        }

        function buildUTCDate(
            dateComponents
            )
        {
            // Do not use Date.UTC because:
            // If y is not NaN and 0 <= ToInteger(y) <= 99, then let yr be 1900+ToInteger(y); otherwise, let yr be y.
            var date = new Date(0);
            date.setUTCFullYear(
                dateComponents.year,
                dateComponents.month - 1,
                dateComponents.day);

            date.setUTCHours(
                dateComponents.hour,
                dateComponents.minute,
                dateComponents.second,
                dateComponents.millisecond);

            if(typeof dateComponents.zone == 'number')
                date = new Date(date.valueOf() - dateComponents.zone * 60 * 1000);

            return date;
        }

        function buildParseDate(
            buildDate
            )
        {
            return function(
                dateFormatPattern,
                value
                )
            {
                dateFormatPattern = dateFormatPattern.replace(
                    /[\^$\\.*+?()[\]{}|]/g,
                    '\\$&');

                var symbolObjects = [];
                var regex = dateFormatPattern.replace(
                    symbolRegex,
                    escape(
                        function(
                            symbol
                            )
                        {
                            var symbolObject = dateFieldSymbols[symbol];

                            if(!symbolObject.regex)
                                return symbol;

                            symbolObjects.push(symbolObject);
                            return symbolObject.regex;
                        }));

                regex = new RegExp(
                    '^' + regex + '$',
                    'i');

                function parse(
                    value
                    )
                {
                    var matches = value.match(regex);

                    if(!matches)
                        return null;

                    var dateComponents = {
                        year       : 1,
                        month      : 1,
                        day        : 1,
                        hour       : 0,
                        minute     : 0,
                        second     : 0,
                        millisecond: 0
                    };

                    matches.shift();
                    symbolObjects.forEach(
                        function(
                            symbolObject
                            )
                        {
                            dateComponents[symbolObject.field] = symbolObject.convert(
                                matches.shift(),
                                matches);
                        });

                    if(dateComponents.year   <   1 ||
                       dateComponents.year   > Date.maxYear ||
                       dateComponents.month  <   1 ||
                       dateComponents.month  >  12 ||
                       dateComponents.day    <   1 ||
                       dateComponents.day    > new Date(dateComponents.year, dateComponents.month, 0).getDate() ||
                       dateComponents.hour   >= 24 ||
                       dateComponents.minute >= 60 ||
                       dateComponents.second >= 60)
                        return null;

                    return buildDate(dateComponents);
                };

                return typeof value == 'undefined' ? parse : parse(value);
            };
        }

        parseDate    = buildParseDate(buildDate   );
        parseUTCDate = buildParseDate(buildUTCDate);
    })();
})();
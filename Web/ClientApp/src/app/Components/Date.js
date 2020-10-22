import { calendar } from "./Cldr"

const dayKeys =
    [
        'sun',
        'mon',
        'tue',
        'wed',
        'thu',
        'fri',
        'sat'
    ];

const monthKeys =
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

const maxYear = 9999;

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
        for(let month = 1;month <= 12;++month)
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
        return names[dayKeys[weekDay]];
    };
}


let dateFieldSymbols;

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
        format: function(year) { return (year % 100).toString().padStart(2, '0'); },
        regex: '(\\d{2})',
        convert: function(value) { return Number(value) + Math.floor(new Date().getFullYear() / 100) * 100; }
    },
    yyyy:
    {
        field: 'year',
        format: function(year) { return year.toString().padStart(4, '0'); },
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
        format: function(month) { return month.toString().padStart(2, '0'); },
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
        format: function(month) { return month.toString().padStart(2, '0'); },
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
        format: function(day) { return day.toString().padStart(2, '0'); },
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
        format: function(hour) { return hour.toString().padStart(2, '0'); },
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
        format: function(minute) { return minute.toString().padStart(2, '0'); },
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
        format: function(second) { return second.toString().padStart(2, '0'); },
        regex: '(\\d{2})',
        convert: Number
    },
    SSS:
    {
        field: 'millisecond',
        format: function(millisecond) { return millisecond.toString().padStart(3, '0'); },
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
            let absZone = Math.abs(zone);
            return (zone >= 0 ? '+' : '-') +
                Math.floor(absZone / 60).toString().padStart(2, '0') +
                (separator ? separator : '') +
                (absZone % 60).toString().padStart(2, '0')
        },
        regex: '((\\+|\\-)(\\d{2})(\\d{2}))',
        convert: function(
            value,
            matches
            )
        {
            let positive = matches.shift() === '+';
            let minutes = Number(matches.shift()) * 60 + Number(matches.shift());
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

const escapeSymbol = "'";
const escapedEscapeSymbol = escapeSymbol + escapeSymbol;

dateFieldSymbols[escapeSymbol       ] = {};
dateFieldSymbols[escapedEscapeSymbol] = {};

function escape(
    f
    )
{
    let escaping = false;

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

let symbols = [];

for(let symbol in dateFieldSymbols)
    symbols.push(symbol);

symbols.sort((x, y) => y.length - x.length);

let symbolRegex = new RegExp(
    '(' + symbols.join('|') + ')',
    'g');

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
            let dateComponents = getDateComponents(date);
            return dateFormatPattern.replace(
                symbolRegex,
                escape(
                    function(
                        symbol
                        )
                    {
                        let symbolObject = dateFieldSymbols[symbol];
                        return symbolObject.format(dateComponents[symbolObject.field]);
                }));
        }

        return typeof date == 'undefined' ? format : format(date);
    };
}

let formatDate    = buildFormatDate(getDateComponents   );
let formatUTCDate = buildFormatDate(getUTCDateComponents);

function buildDate(
    dateComponents
    )
{
    // Do not use Date constructor because:
    // If y is not NaN and 0 <= ToInteger(y) <= 99, then let yr be 1900+ToInteger(y); otherwise, let yr be y.
    let date = new Date(0);
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
    let date = new Date(0);
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

        let symbolObjects = [];
        let regex = dateFormatPattern.replace(
            symbolRegex,
            escape(
                function(
                    symbol
                    )
                {
                    let symbolObject = dateFieldSymbols[symbol];

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
            let matches = value.match(regex);

            if(!matches)
                return null;

            let dateComponents = {
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
               dateComponents.year   > maxYear ||
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

let parseDate    = buildParseDate(buildDate   );
let parseUTCDate = buildParseDate(buildUTCDate);

export
{
    dayKeys,
    dateFieldSymbols,
    formatDate,
    formatUTCDate,
    parseDate,
    parseUTCDate
};

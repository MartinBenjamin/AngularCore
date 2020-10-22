import { numberSymbols } from "./Cldr";
let parser = {};

(function()
{
    parser.match = function(
        ruleName,
        input,
        position
        )
    {
        this.ruleName = ruleName;
        this.input    = input;
        this.position = position;
        this.length   = 0;
        this.children = [];
    }

    parser.match.prototype.getValue = function()
    {
        return this.input.substring(
            this.position,
            this.position + this.length);
    };

    parser.match.prototype.select = function(
        selector
        )
    {
        let selected = [];
        if(selector(this))
            selected.push(this);

        this.children.forEach(
            function(
                match
                )
            {
                selected = selected.concat(match.select(selector));
            });

        return selected;
    };

    parser.empty = function()
    {
        this.link = function(){};

        this.parse = function(
            input,
            position
            )
        {
            return new parser.match(
                this.ruleName,
                input,
                position);
        };
    };

    parser.choice = function(
        expressions
        )
    {
        this.link = function(
            rules
            )
        {
            expressions = expressions.map(
                function(
                    expression
                    )
                {
                    if(typeof expression != 'string')
                    {
                        expression.link(rules);
                        return expression;
                    }

                    if(expression in rules)
                        return rules[expression];

                    throw new SyntaxError(
                        'Unknown rule name: \'' + expression + '\'.');
                });
        };

        this.parse = function(
            input,
            position
            )
        {
            let m = new parser.match(
                this.ruleName,
                input,
                position);

            for(let index = 0;index < expressions.length;++index)
            {
                let childMatch = expressions[index].parse(
                    input,
                    position);

                if(childMatch)
                {
                    m.length += childMatch.length;
                    m.children.push(childMatch);
                    return m;
                }
            }

            return null;
        };
    }

    parser.sequence = function(
        expressions
        )
    {
        this.link = function(
            rules
            )
        {
            expressions = expressions.map(
                function(
                    expression
                    )
                {
                    if(typeof expression != 'string')
                    {
                        expression.link(rules);
                        return expression;
                    }

                    if(expression in rules)
                        return rules[expression];

                    throw new SyntaxError(
                        'Unknown rule name: \'' + expression + '\'.');
                });
        };

        this.parse = function(
            input,
            position
            )
        {
            let m = new parser.match(
                this.ruleName,
                input,
                position);

            for(let index = 0;index < expressions.length;++index)
            {
                let childMatch = expressions[index].parse(
                    input,
                    position + m.length);

                if(!childMatch)
                    return null;

                m.length += childMatch.length;
                m.children.push(childMatch);
            }

            return m;
        };
    }

    parser.optional = function(
        expression
        )
    {
        this.link = function(
            rules
            )
        {
            if(typeof expression != 'string')
                expression.link(rules);

            else
            {
                if(expression in rules)
                    expression = rules[expression];

                else
                    throw new SyntaxError(
                        'Unknown rule name: \'' + expression + '\'.');
            }
        };

        this.parse = function(
            input,
            position
            )
        {
            let m = new parser.match(
                this.ruleName,
                input,
                position);

            let childMatch = expression.parse(
                input,
                position);

            if(childMatch)
            {
                m.children.push(childMatch);
                m.length = childMatch.length;
            }

            return m;
        };
    }

    parser.zeroOrMore = function(
        expression
        )
    {
        this.link = function(
            rules
            )
        {
            if(typeof expression != 'string')
                expression.link(rules);

            else
            {
                if(expression in rules)
                    expression = rules[expression];

                else
                    throw new SyntaxError(
                        'Unknown rule name: \'' + expression + '\'.');
            }
        };

        this.parse = function(
            input,
            position
            )
        {
            let m = new parser.match(
                this.ruleName,
                input,
                position);

            let childMatch = null;
            do
            {
                childMatch = expression.parse(
                    input,
                    position + m.length);

                if(childMatch)
                {
                    m.length += childMatch.length;
                    m.children.push(childMatch);
                }
            }
            while(childMatch)

            return m;
        };
    }

    parser.oneOrMore = function(
        expression
        )
    {
        this.link = function(
            rules
            )
        {
            if(typeof expression != 'string')
                expression.link(rules);

            else
            {
                if(expression in rules)
                    expression = rules[expression];

                else
                    throw new SyntaxError(
                        'Unknown rule name: \'' + expression + '\'.');
            }
        };

        this.parse = function(
            input,
            position
            )
        {
            let m = new parser.match(
                this.ruleName,
                input,
                position);

            let childMatch = null;
            do
            {
                childMatch = expression.parse(
                    input,
                    position + m.length);

                if(childMatch)
                {
                    m.length += childMatch.length;
                    m.children.push(childMatch);
                }
            }
            while(childMatch)

            if(m.children.length)
                return m;

            return null;
        };
    }

    parser.repetition = function(
        expression,
        min,
        max
        )
    {
        this.link = function(
            rules
            )
        {
            if(typeof expression != 'string')
                expression.link(rules);

            else
            {
                if(expression in rules)
                    expression = rules[expression];

                else
                    throw new SyntaxError(
                        'Unknown rule name: \'' + expression + '\'.');
            }
        };

        this.parse = function(
            input,
            position
            )
        {
            let m = new parser.match(
                this.ruleName,
                input,
                position);

            let childMatch = null;
            do
            {
                childMatch = expression.parse(
                    input,
                    position + m.length);

                if(childMatch)
                {
                    m.length += childMatch.length;
                    m.children.push(childMatch);

                    if(max && m.children.length == max)
                        return m;
                }
            }
            while(childMatch)

            if(m.children.length >= min)
                return m;

            return null;
        };
    }

    parser.terminal = function(
        symbol
        )
    {
        this.link = function(){};

        this.parse = function(
           input,
           position
           )
        {
            if(position >= input.length)
                return null;

            if((symbol.constructor == RegExp && input.charAt(position).match(symbol)) || input.charAt(position) == symbol)
            {
                let m = new parser.match(
                    this.ruleName,
                    input,
                    position);

                m.length = 1;
                return m;
            }

            return null;
        };
    }

    parser.eos = function()
    {
        this.link = function(){};

        this.parse = function(
            input,
            position
            )
        {
            if(position < input.length)
                return null;

            return new parser.match(
                this.ruleName,
                input,
                position);
        };
    };
})();

function numberFormatSubpattern(
    minimumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
    primaryGroupingSize,
    secondaryGroupingSize
    )
{
    this.minimumIntegerDigits  = minimumIntegerDigits;
    this.minimumFractionDigits = minimumFractionDigits;
    this.maximumFractionDigits = maximumFractionDigits;
    this.primaryGroupingSize   = primaryGroupingSize;
    this.secondaryGroupingSize = secondaryGroupingSize;
}

function numberFormatPattern(
    positiveSubpattern,
    negativeSubpattern
    )
{
    this.positive = positiveSubpattern;
    this.negative = negativeSubpattern;
}

let parseNumberFormatPattern;
let formatNumber;
(function()
{
    const syntaxCharacters = /[\^$\\.*+?()[\]{}|]/g;

    const escapeSymbol = "'";
    const escapedEscapeSymbol = escapeSymbol + escapeSymbol;

    let affixSymbols =
    {
        '+': numberSymbols.plusSign,
        '-': numberSymbols.minusSign
    };
    affixSymbols[escapeSymbol       ] = null;
    affixSymbols[escapedEscapeSymbol] = null;

    let symbols = [];
    for(let symbol in affixSymbols)
        symbols.push(symbol);

    symbols.sort((x, y) => y.length - x.length);

    let escapedSymbols = symbols.map(
        function(
            symbol
            )
        {
            return symbol.replace(
                syntaxCharacters,
                '\\$&');
        });

    let symbolRegex = new RegExp(
        '(' + escapedSymbols.join('|') + ')',
        'g');

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

    numberFormatSubpattern.prototype.fractionRegex = function()
    {
        let decimalRegex = numberSymbols.decimal.replace(
            syntaxCharacters,
            '\\$&');

        let fractionRegex = '';
        if(this.maximumFractionDigits)
        {
            if(this.minimumFractionDigits === 0)
                fractionRegex = '(' + decimalRegex + '\\d{1,' + this.maximumFractionDigits + '})?';

            else if(this.minimumFractionDigits < this.maximumFractionDigits)
                fractionRegex = decimalRegex + '\\d{' + this.minimumFractionDigits + ',' + this.maximumFractionDigits + '}';

            else
                fractionRegex = decimalRegex + '\\d{' + this.maximumFractionDigits + '}';
        }
        
        return fractionRegex;
    };

    numberFormatSubpattern.prototype.integerRegex = function()
    {
        let groupRegex = numberSymbols.group.replace(
            syntaxCharacters,
            '\\$&');

        let integerRegex = ''
        if(!this.primaryGroupingSize)
            integerRegex = '([1-9]\\d*)?\\d{' + this.minimumIntegerDigits + '}';

        else
        {
            let secondaryGroupingSize = this.secondaryGroupingSize ? this.secondaryGroupingSize : this.primaryGroupingSize;

            let groupSize = this.primaryGroupingSize;
            let minimumIntegerDigits = this.minimumIntegerDigits;
            let secondary = false;

            while(minimumIntegerDigits >= groupSize)
            {
                integerRegex = secondary ? groupRegex + integerRegex : integerRegex;
                integerRegex = '\\d{' + groupSize + '}' + integerRegex;
                minimumIntegerDigits -= groupSize;
                groupSize = secondaryGroupingSize;
                secondary = true;
            }

            if(minimumIntegerDigits)
                integerRegex = '(' +
                    [
                        '[1-9]\\d{0,' + (secondaryGroupingSize - 1) + '}' + groupRegex + '(\\d{' + secondaryGroupingSize + '}' + groupRegex + ')*' + '\\d{' + (groupSize - minimumIntegerDigits) + '}',
                        '[1-9]\\d{0,' + (groupSize - minimumIntegerDigits - 1) + '}',
                        ''
                    ].join('|') +
                    ')' +
                    '\\d{' + minimumIntegerDigits + '}' + (secondary ? groupRegex + integerRegex : integerRegex);

            else
                integerRegex = '(' +
                    [
                        '[1-9]\\d{0,' + (secondaryGroupingSize - 1) + '}' + groupRegex + '(\\d{' + secondaryGroupingSize + '}' + groupRegex + ')*',
                        ''
                    ].join('|') +
                    ')' +
                    integerRegex;
        }

        return integerRegex;
    };

    numberFormatSubpattern.prototype.numberRegex = function()
    {
        return '(' + this.integerRegex() + this.fractionRegex() + ')';
    };

    function affixRegex(
        affix
        )
    {
        return !affix ? '' : affix.replace(
            symbolRegex,
            escape(
                function(
                    symbol
                    )
                {
                    return affixSymbols[symbol];
                })).replace(
            syntaxCharacters,
            '\\$&');
    }

    numberFormatSubpattern.prototype.prefixRegex = function()
    {
        return affixRegex(this.prefix);
    };

    numberFormatSubpattern.prototype.suffixRegex = function()
    {
        return affixRegex(this.suffix);
    };

    numberFormatSubpattern.prototype.regex = function()
    {
        return this.prefixRegex() + this.numberRegex() + this.suffixRegex();
    };

    numberFormatSubpattern.prototype.toString = function()
    {
        let subpattern = '';

        if(this.maximumFractionDigits)
        {
            subpattern += '.';
            let fractionDigits = 0;
            while(fractionDigits < this.minimumFractionDigits)
            {
                subpattern += '0';
                ++fractionDigits;
            }

            while(fractionDigits < this.maximumFractionDigits)
            {
                subpattern += '#';
                ++fractionDigits;
            }
        }

        let integerDigits = 0;
        let requiredDigits = Math.max(this.minimumIntegerDigits, 1);

        if(this.primaryGroupingSize)
            requiredDigits = Math.max(this.minimumIntegerDigits, this.primaryGroupingSize + (this.secondaryGroupingSize ? this.secondaryGroupingSize : 0) + 1);

        while(integerDigits < requiredDigits)
        {
            if(this.primaryGroupingSize)
            {
                if(integerDigits == this.primaryGroupingSize ||
                   (this.secondaryGroupingSize && integerDigits == this.primaryGroupingSize + this.secondaryGroupingSize))
                    subpattern = ',' + subpattern;
            }

            subpattern = (integerDigits < this.minimumIntegerDigits ? '0' : '#') + subpattern;
            ++integerDigits;
        }

        if(this.prefix)
            subpattern = this.prefix + subpattern;

        if(this.suffix)
            subpattern += this.suffix;

        return subpattern;
    }; 

    numberFormatPattern.prototype.positiveSubpatternRegex = function()
    {
        return this.positive.regex();
    };
     
    numberFormatPattern.prototype.negativeSubpatternRegex = function()
    {
        let minusRegex = numberSymbols.minusSign.replace(
            syntaxCharacters,
            '\\$&');

        if(!this.negative)
            return minusRegex + this.positive.regex();

        return this.negative.prefixRegex() + this.positive.numberRegex() + this.negative.suffixRegex();
    };

    numberFormatPattern.prototype.regexes = function()
    {
        let regexes =
        {
            positive: this.positiveSubpatternRegex(),
            negative: this.negativeSubpatternRegex()
        };

        for(let polarity in regexes)
            regexes[polarity] = new RegExp(
            '^' + regexes[polarity] + '$',
            'g');

        return regexes;
    };

    numberFormatPattern.prototype.toString = function()
    {
        return this.positive.toString() + (this.negative ? ';' + this.negative.toString() : '');
    };

    
    let numberFormatPatternRules =
    {
        pattern       : new parser.sequence(['subpattern', new parser.optional(new parser.sequence([new parser.terminal(';'), 'subpattern'])), new parser.eos()]),
        subpattern    : new parser.sequence(['prefix', 'number', 'suffix']),
        prefix        : new parser.optional('affix'),
        suffix        : new parser.optional('affix'),
        affix         : new parser.oneOrMore(new parser.choice(['escapedEscape', 'escaped', new parser.terminal(/^[^#0.,;]$/)])),
        number        : new parser.sequence(['integer', new parser.optional(new parser.sequence(['decimal', 'fraction']))]),
        integer       : new parser.sequence([new parser.optional('padding'), 'minimumDigits']),
        padding       : new parser.sequence(['firstHashGroup', new parser.zeroOrMore('hashGroup'), new parser.optional('hashes')]),
        minimumDigits : new parser.sequence([new parser.zeroOrMore('zeroGroup'), 'zeros']),
        fraction      : new parser.choice([new parser.sequence([new parser.optional('zeros'), 'hashes']), 'zeros']),
        firstHashGroup: new parser.sequence(['hash', 'group']),
        hashGroup     : new parser.sequence(['hashes', 'group']),
        zeroGroup     : new parser.sequence(['zeros', 'group']),
        hashes        : new parser.oneOrMore('hash'),
        zeros         : new parser.oneOrMore('zero'),
        hash          : new parser.terminal('#'),
        zero          : new parser.terminal('0'),
        group         : new parser.terminal(','),
        decimal       : new parser.terminal('.'),
        escape        : new parser.terminal("'"),
        escapedEscape : new parser.sequence(['escape', 'escape']),
        escaped       : new parser.sequence(['escape', new parser.oneOrMore(new parser.choice([new parser.terminal(/^[^']$/), 'escapedEscape'])), 'escape'])
    };

    for(let ruleName in numberFormatPatternRules)
    {
        numberFormatPatternRules[ruleName].link(numberFormatPatternRules);
        numberFormatPatternRules[ruleName].ruleName = ruleName;
    }

    parseNumberFormatPattern = function(
        pattern
        )
    {
        let patternMatch = numberFormatPatternRules.pattern.parse(
            pattern,
            0);

        if(!patternMatch)
            return null;

        function buildSubpattern(
            subpatternMatch
            )
        {
            let subpattern = new numberFormatSubpattern(0, 0, 0);
            let integerMatch  = subpatternMatch.select(function(m) { return m.ruleName == 'integer';  })[0];
            let fractionMatch = subpatternMatch.select(function(m) { return m.ruleName == 'fraction'; })[0];
            let prefixMatch   = subpatternMatch.select(function(m) { return m.ruleName == 'prefix';   })[0];
            let suffixMatch   = subpatternMatch.select(function(m) { return m.ruleName == 'suffix';   })[0];
            subpattern.minimumIntegerDigits = integerMatch.select(function(m) { return m.ruleName == 'zero'; }).length;

            if(fractionMatch)
            {
                subpattern.minimumFractionDigits = fractionMatch.select(function(m) { return m.ruleName == 'zero'; }).length;
                subpattern.maximumFractionDigits = subpattern.minimumFractionDigits + fractionMatch.select(function(m) { return m.ruleName == 'hash'; }).length;
            }

            let groups = integerMatch.getValue().split(',').reverse();
            if(groups.length > 1)
                subpattern.primaryGroupingSize = groups[0].length;

            if(groups.length > 2)
                subpattern.secondaryGroupingSize = groups[1].length;

            if(prefixMatch)
                subpattern.prefix = prefixMatch.getValue();

            if(suffixMatch)
                subpattern.suffix = suffixMatch.getValue();

            return subpattern;
        }

        let subpatternMatches = patternMatch.select(function(m) { return m.ruleName == 'subpattern'; });
        let positiveSubpattern = buildSubpattern(subpatternMatches[0]);
        
        pattern = new numberFormatPattern(positiveSubpattern);

        if(subpatternMatches.length == 2)
            pattern.negative = buildSubpattern(subpatternMatches[1]);

        return pattern;
    };

    formatNumber = function(
        numberFormatPattern,
        number
        )
    {
        let pattern = typeof numberFormatPattern == 'string' ? parseNumberFormatPattern(numberFormatPattern) : numberFormatPattern;
        let positiveSubpattern = pattern.positive;
        let negativeSubpattern = pattern.negative;
        let transformations = [];

        let affixes =
        {
            positive:
            {
                prefix: positiveSubpattern.prefix ? positiveSubpattern.prefix : '',
                suffix: positiveSubpattern.suffix ? positiveSubpattern.suffix : ''
            },
            negative:
            {
                prefix: negativeSubpattern ? (negativeSubpattern.prefix ? negativeSubpattern.prefix : '') : '-',
                suffix: negativeSubpattern && negativeSubpattern.suffix ? negativeSubpattern.suffix : ''
            }
        };

        for(let polarity in affixes)
            for(let affix in affixes[polarity])
                affixes[polarity][affix] = affixes[polarity][affix].replace(
                    symbolRegex,
                    escape(
                        function(
                            symbol
                            )
                        {
                            return affixSymbols[symbol];
                        }));

        transformations.push(
            function(
                number
                )
            {
                let positive = number >= 0;
                number = positive ? number : -number;
                let components = number.toFixed(positiveSubpattern.maximumFractionDigits).split('.');
                components[0] = components[0].replace(
                    /^0+/,
                    '');
                return {
                    affixes : positive ? affixes.positive : affixes.negative,
                    integer : components[0],
                    fraction: components.length > 1 ? components[1] : ''
                };
            });

        let padding = '';
        while(padding.length < positiveSubpattern.minimumIntegerDigits)
            padding += '0';

        transformations.push(
            function(
                number
                )
            {
                return {
                    affixes : number.affixes,
                    integer : padding.substring(number.integer.length) + number.integer,
                    fraction: number.fraction
                };
            });

        if(positiveSubpattern.primaryGroupingSize)
        {
            let groupRegex = new RegExp(
                '(\\d)(?=(\\d{' + (positiveSubpattern.secondaryGroupingSize ? positiveSubpattern.secondaryGroupingSize : positiveSubpattern.primaryGroupingSize) + '})*\\d{' + positiveSubpattern.primaryGroupingSize + '}$)',
                'g');

            transformations.push(
                function(
                    number
                    )
                {
                    return {
                        affixes : number.affixes,
                        integer : number.integer.replace(
                            groupRegex,
                            '$1' + numberSymbols.group),
                        fraction: number.fraction
                    };
                });
        }

        if(positiveSubpattern.maximumFractionDigits > positiveSubpattern.minimumFractionDigits)
        {
            let trailingZeroRegex = new RegExp(
                '0{1,' + (positiveSubpattern.maximumFractionDigits - positiveSubpattern.minimumFractionDigits) + '}$',
                'g')

            transformations.push(
                function(
                    number
                    )
                {
                    return {
                        affixes : number.affixes,
                        integer : number.integer,
                        fraction: number.fraction.replace(
                            trailingZeroRegex,
                            '')
                    };
                });
        }

        transformations.push(
            function(
                number
                )
            {
                return number.affixes.prefix +
                    number.integer +
                    (number.fraction.length ? numberSymbols.decimal + number.fraction : '') +
                    number.affixes.suffix;
            });

        function format(
            number
            )
        {
            transformations.forEach(
                function(
                    transformation
                    )
                {
                    number = transformation(number);
                });

            return number;
        }

        return typeof number == 'undefined' ? format : format(number);
    };

})();

function parseNumber(
    numberFormatPattern,
    value
    )
{
    let pattern = typeof numberFormatPattern == 'string' ? parseNumberFormatPattern(numberFormatPattern) : numberFormatPattern;
    let regexes = pattern.regexes();
    let multipliers =
    {
        positive: +1,
        negative: -1
    };
    let nonDecimal = new RegExp(
        '[^0-9' + numberSymbols.decimal + ']',
        'g');

    function parse(
        value
        )
    {
        let match;
        for(let polarity in regexes)
        {
            regexes[polarity].lastIndex = 0;
            if(match = regexes[polarity].exec(value))
                return multipliers[polarity] * Number(match[1].replace(nonDecimal, '').replace(numberSymbols.decimal, '.'));
        }

        return NaN;
    }

    return typeof value == 'undefined' ? parse : parse(value);
}

export
{
    numberFormatPattern,
    numberFormatSubpattern,
    parseNumberFormatPattern,
    formatNumber,
    parseNumber
};

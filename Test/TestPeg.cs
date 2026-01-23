using CommonDomainObjects;
using NUnit.Framework;
using Peg;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    [TestFixture]
    public class TestPeg
    {
        private const string _listenerName = "TestListener";

        [SetUp]
        public void SetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }

        public void TestExpression(
            Expression expression,
            string     input,
            int        match
            )
        {
            Assert.That(expression.Parse(input, 0), Is.EqualTo(match));
        }

        public void TestExpression(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            var node = expression.Parse2(
                input,
                0);
            Assert.That(node, Is.Not.Null);
            Assert.That(node.Match, Is.EqualTo(match));
            Assert.That(node.Length, Is.EqualTo(length));
        }

        [TestCaseSource("LiteralTestCases"   )]
        public void TestLiteral(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("CharacterSetTestCases")]
        public void TestCharacterSet(
            Expression expression,
            string     input,
            int        match
            )
        {
            TestExpression(
                expression,
                input,
                match);
        }

        [TestCaseSource("OptionalTestCases"  )]
        public void TestOptional(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("ZeroOrMoreTestCases")]
        public void TestZeroOrMore(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("OneOrMoreTestCases" )]
        public void TestOneOrMore(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("AndTestCases"       )]
        public void TestAnd(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("NotTestCases"       )]
        public void TestNot(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("SequenceTestCases"  )]
        public void TestSequence(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [TestCaseSource("ChoiceTestCases"    )]
        public void TestChoice(
            Expression expression,
            string     input,
            bool       match,
            int        length
            )
        {
            TestExpression(
                expression,
                input,
                match,
                length);
        }

        [Test]
        public void TestGrammer()
        {
            var parser = new Parser();
            var grammar = parser.ToString();
            Trace.Write(grammar);
            Assert.That(parser.Grammar.Parse(grammar, 0), Is.EqualTo(grammar.Length));
        }

        public static IEnumerable<object[]> LiteralTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var literal = "ABC";
                var expression = new Literal(literal);

                var input = literal + 'D';
                testCases.AddRange(
                    from length in Enumerable.Range(0, input.Length + 1)
                    let match = length >= literal.Length
                    select new object[]
                    {
                        expression,
                        input.Substring(0, length),
                        match,
                        match ? literal.Length : 0
                    });

                return testCases;
            }
        }

        public static IEnumerable<object[]> CharacterSetTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var testCharacters = "ABCDE";
                var range = new Range<char>(
                    testCharacters[1],
                    testCharacters[1 + 2]);
                var characters = testCharacters.Substring(1, 3);

                Expression expression = new CharacterSet(range);
                testCases.AddRange(
                    from c in testCharacters
                    select new object[]
                    {
                        expression,
                        c.ToString(),
                        range.Contains(c) ? 1 : -1
                    });

                expression = new CharacterSetComplement(range);
                testCases.AddRange(
                    from c in testCharacters
                    select new object[]
                    {
                        expression,
                        c.ToString(),
                        range.Contains(c) ? -1 : 1
                    });

                expression = new CharacterSet(characters);
                testCases.AddRange(
                    from c in testCharacters
                    select new object[]
                    {
                        expression,
                        c.ToString(),
                        characters.Contains(c) ? 1 : -1
                    });

                expression = new CharacterSetComplement(characters);
                testCases.AddRange(
                    from c in testCharacters
                    select new object[]
                    {
                        expression,
                        c.ToString(),
                        characters.Contains(c) ? -1 : 1
                    });

                expression = new Dot();
                testCases.AddRange(
                    from c in testCharacters
                    select new object[]
                    {
                        expression,
                        c.ToString(),
                        1
                    });

                testCases.Add(
                    new object[]
                    {
                        expression,
                        string.Empty,
                        -1
                    });

                return testCases;
            }
        }

        public static IEnumerable<object[]> OptionalTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var a = new Literal("A");
                var b = new Literal("B");
                var expression = new Sequence(
                    new Optional(a),
                    b);
                testCases.AddRange(
                    from count in Enumerable.Range(0, 2)
                    select new object[]
                    {
                        expression,
                        new string(Enumerable.Repeat('A', count).ToArray()) + 'B',
                        true,
                        count + 1
                    });
                return testCases;
            }
        }

        public static IEnumerable<object[]> ZeroOrMoreTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var a = new Literal("A");
                var b = new Literal("B");
                var expression = new Sequence(
                    new ZeroOrMore(a),
                    b);
                testCases.AddRange(
                    from count in Enumerable.Range(0, 3)
                    select new object[]
                    {
                        expression,
                        new string(Enumerable.Repeat('A', count).ToArray()) + 'B',
                        true,
                        count + 1
                    });
                return testCases;
            }
        }

        public static IEnumerable<object[]> OneOrMoreTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var a = new Literal("A");
                var b = new Literal("B");
                var expression = new Sequence(
                    new OneOrMore(a),
                    b);
                testCases.AddRange(
                    from count in Enumerable.Range(0, 3)
                    let match = count >= 1
                    select new object[]
                    {
                        expression,
                        new string(Enumerable.Repeat('A', count).ToArray()) + 'B',
                        match,
                        match ? count + 1 : 0
                    });
                return testCases;
            }
        }

        public static IEnumerable<object[]> AndTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var literals = new[] { "A", "B" };
                var expression = new And(new Literal(literals[0]));
                testCases.AddRange(
                    from literal in literals
                    select new object[]
                    {
                        expression,
                        literal,
                        literal == literals[0],
                        0
                    });
                return testCases;
            }
        }

        public static IEnumerable<object[]> NotTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var literals = new[] { "A", "B" };
                var expression = new Not(new Literal(literals[0]));
                testCases.AddRange(
                    from literal in literals
                    select new object[]
                    {
                        expression,
                        literal,
                        literal != literals[0],
                        0
                    });
                return testCases;
            }
        }

        public static IEnumerable<object[]> SequenceTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var input = "ABC";
                testCases.AddRange(
                    from length in Enumerable.Range(0, input.Length + 1)
                    from inputLength in Enumerable.Range(0, length + 1)
                    select new object[]
                    {
                        new Sequence(
                            input
                                .Substring(0, length)
                                .Select(c => new Literal(c.ToString()))
                                .ToArray()),
                        input.Substring(0, inputLength),
                        inputLength == length,
                        inputLength
                    });

                testCases.AddRange(
                    from length in Enumerable.Range(0, input.Length + 1)
                    from inputLength in Enumerable.Range(0, length)
                    select new object[]
                    {
                        new Sequence(
                            input
                                .Substring(0, length)
                                .Select(c => new Literal(c.ToString()))
                                .ToArray()),
                        input.Substring(0, inputLength) + 'X',
                        false,
                        inputLength
                    });

                return testCases;
            }
        }

        public static IEnumerable<object[]> ChoiceTestCases
        {
            get
            {
                var testCases = new List<object[]>();
                var choices = "ABC".ToCharArray();
                var expression = new Choice(
                    choices.Select(c => new Literal(c.ToString())).ToArray());
                testCases.AddRange(
                    from c in choices.Append('X')
                    let match = choices.Contains(c)
                    select new object[]
                    {
                        expression,
                        c.ToString(),
                        match,
                        match ? 1 : 0
                    });
                return testCases;
            }
        }
    }
}

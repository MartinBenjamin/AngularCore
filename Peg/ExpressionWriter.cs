using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Peg
{
    public class ExpressionWriter : IExpressionWriter
    {
        private readonly IDictionary<char, string> _literalEscape = new Dictionary<char, string>
        {
            {'\\', "\\\\"},
            {'\r', "\\r" },
            {'\n', "\\n" },
            {'\t', "\\t" },
            {'"' , "\\\""}
        };

        private readonly IDictionary<char, string> _characterSetEscape = new Dictionary<char, string>
        {
            {'\\', "\\\\"},
            {'\r', "\\r" },
            {'\n', "\\n" },
            {'\t', "\\t" },
            {']' , "\\]" }
        };

        private readonly StringBuilder _builder;

        public ExpressionWriter(
            StringBuilder builder
            )
        {
            _builder = builder;
        }

        void IExpressionWriter.Write(
            Expression expression
            )
        {
            expression.Write(this);
        }

        void IExpressionWriter.Write(
            Definition definition
            )
        {
            _builder.Append(definition.Identifier ?? string.Empty);
        }

        void IExpressionWriter.Write(
            Literal literal
            )
        {
            _builder.Append('"');
            foreach(var c in literal.Value)
                _builder.Append(_literalEscape.TryGetValue(c, out string escaped) ? escaped : c);
            _builder.Append('"');
        }

        void IExpressionWriter.Write(
            CharacterSet characterSet
            )
        {
            _builder.Append("[");
            Write(characterSet.Ranges);
            _builder.Append(']');
        }

        void IExpressionWriter.Write(
            Dot dot
            )
        {
            _builder.Append('.');
        }

        void IExpressionWriter.Write(
            Optional optional
            )
        {
            Write(
                optional,
                optional.Repeated);
            _builder.Append('?');
        }

        void IExpressionWriter.Write(
            ZeroOrMore zeroOrMore
            )
        {
            Write(
                zeroOrMore,
                zeroOrMore.Repeated);
            _builder.Append('*');
        }

        void IExpressionWriter.Write(
            OneOrMore oneOrMore
            )
        {
            Write(
                oneOrMore,
                oneOrMore.Repeated);
            _builder.Append('+');
        }

        void IExpressionWriter.Write(
            And and
            )
        {
            _builder.Append('&');
            Write(
                and,
                and.Expression);
        }

        void IExpressionWriter.Write(
            Not not
            )
        {
            _builder.Append('!');
            Write(
                not,
                not.Expression);
        }

        void IExpressionWriter.Write(
            Sequence sequence
            )
        {
            if(sequence.Children.Any())
            {
                Write(
                    sequence,
                    sequence.Children.First());

                foreach(var child in sequence.Children.Skip(1))
                {
                    _builder.Append(' ');
                    Write(
                        sequence,
                        child);
                }
            }
        }

        void IExpressionWriter.Write(
            Choice choice
            )
        {
            if(choice.Children.Any())
            {
                Write(
                    choice,
                    choice.Children.First());

                foreach(var child in choice.Children.Skip(1))
                {
                    _builder.Append(" / ");
                    Write(
                        choice,
                        child);
                }
            }
        }

        public static string Write(
            IEnumerable<Definition> definitions
            )
        {
            var builder = new StringBuilder();
            IExpressionWriter writer = new ExpressionWriter(builder);
            foreach(var definition in definitions)
            {
                writer.Write(definition);
                builder.Append(" <- ");
                writer.Write(definition.Expression);
                builder.AppendLine();
            }

            return builder.ToString();
        }

        private void Write(
            Expression expression,
            Expression subExpression
            )
        {
            if(subExpression.Precedence < expression.Precedence)
            {
                _builder.Append('(');
                subExpression.Write(this);
                _builder.Append(')');
            }
            else
                subExpression.Write(this);
        }

        private void Write(
            IEnumerable<Range<char>> ranges
            )
        {
            foreach(var range in ranges)
                if(range.Start == range.End)
                    _builder.Append(_characterSetEscape.TryGetValue(range.Start, out string escaped) ? escaped : range.Start);

                else
                {
                    _builder
                        .Append(_characterSetEscape.TryGetValue(range.Start, out string escaped) ? escaped : range.Start)
                        .Append('-')
                        .Append(_characterSetEscape.TryGetValue(range.End, out escaped) ? escaped : range.End);
                }
        }
    }
}

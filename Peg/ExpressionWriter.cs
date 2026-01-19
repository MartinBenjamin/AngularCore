using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Peg
{
    public class ExpressionWriter : IExpressionWriter
    {
        private readonly StringBuilder _builder;
        private          char[]        _escaped;

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
            _escaped = "\\\"".ToCharArray();
            _builder.Append('"');
            foreach(var c in literal.Value)
                _builder.Append(Escape(c));
            _builder.Append('"');
        }

        void IExpressionWriter.Write(
            CharacterSet characterSet
            )
        {
            _builder.Append("[");
            Write(characterSet.Subsets);
            _builder.Append(']');
        }

        void IExpressionWriter.Write(
            CharacterSetComplement characterSetComplement
            )
        {
            _builder.Append("[^");
            Write(characterSetComplement.Subsets);
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
            IEnumerable<Union<char[], Range<char>>> subsets
            )
        {
            _escaped = "\\-]".ToCharArray();
            foreach(var subset in subsets)
                subset.Switch(
                    characters =>
                    {
                        foreach(var c in characters)
                            _builder.Append(Escape(c));
                    },
                    range => _builder
                        .Append(Escape(range.Start))
                        .Append('-')
                        .Append(Escape(range.End)),
                    null);
        }

        private string Escape(
            char c
            )
        {
            return _escaped.Contains(c) ? "\\" + c : c.ToString();
        }
    }
}

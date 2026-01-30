using System;
using System.Collections.Generic;

namespace Peg
{
    public abstract class Repetition: Expression
    {
        private int  _min;
        private int? _max;

        public Expression Repeated { get; private set; }

        protected Repetition(
            Expression repeated,
            int        min,
            int?       max
            ) : base(4)
        {
            if(max.HasValue && !(max >= min))
                throw new ArgumentException(
                    "Must greater than or equal to min.",
                    "max");

            _min     = min;
            _max     = max;
            Repeated = repeated;
        }

        public Repetition(
            Expression repeated,
            int        min
            ) : this(
                repeated,
                min,
                null)
        {
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            int length = 0;
            int matches = 0;
            int childLength;
            do
            {
                childLength = Repeated.Parse(
                    input,
                    position + length);

                if(childLength >= 0)
                {
                    length += childLength;
                    matches += 1;
                    if(_max.HasValue && matches == _max)
                    {
                        Match?.Invoke(
                           this,
                           input,
                           position,
                           length);

                        return length;
                    }
                }
            }
            while(childLength >= 0);

            if(matches >= _min)
            {
                Match?.Invoke(
                   this,
                   input,
                   position,
                   length);

                return length;
            }

            return NoMatch(position + length);
        }

        public override Node Parse2(
            string input,
            int    position
            )
        {
            IList<Node> children = [];
            var currentPosition = position;

            while(true)
            {
                var childNode = Repeated.Parse2(
                    input,
                    currentPosition);

                if(childNode.Match)
                {
                    children.Add(childNode);
                    currentPosition += childNode.Length;
                    if(_max.HasValue && children.Count == _max)
                        return new NonTerminalNode(
                            this,
                            input,
                            position,
                            true,
                            children);
                }
                else
                {
                    if(children.Count >= _min)
                        return new NonTerminalNode(
                            this,
                            input,
                            position,
                            true,
                            children);

                    children.Add(childNode);
                    return new NonTerminalNode(
                        this,
                        input,
                        position,
                        false,
                        children);
                }
            }
        }

        public override IEnumerable<Event> Parse3(
            string input,
            int    position
            )
        {
            yield return new Begin(
                this,
                input,
                position);

            var length = 0;
            var childCount = 0;
            while(true)
            {
                End last = null;
                foreach (var parseEvent in Repeated.Parse3(input, position + length))
                {
                    yield return parseEvent;
                    last = parseEvent as End;
                }

                if(last.Match)
                {
                    length += last.Length;
                    ++childCount;
                    if(_max.HasValue && childCount == _max)
                        yield return new End(
                            this,
                            input,
                            position,
                            length,
                            true);
                }
                else
                {
                    if(childCount >= _min)
                        yield return new End(
                            this,
                            input,
                            position,
                            length,
                            true);

                    else
                        yield return new End(
                            this,
                            input,
                            position,
                            length + last.Length,
                            false);

                    yield break;
                }
            }
        }
    }

    public class Optional: Repetition // ZeroOrOne
    {
        public Optional(
            Expression optional
            ) : base(
                optional,
                0,
                1)
        {
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }

    public class ZeroOrMore: Repetition
    {
        public ZeroOrMore(
            Expression repeated
            ) : base(
                repeated,
                0)
        {
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }

    public class OneOrMore: Repetition
    {
        public OneOrMore(
            Expression repeated
            ) : base(
                repeated,
                1)
        {
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}

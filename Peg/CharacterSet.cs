using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Peg
{
    public class CharacterSet: Expression
    {
        public IReadOnlyList<Range<char>> Ranges { get; private set; }

        public CharacterSet(
            params Union<char[], Range<char>>[] ranges
            ) : base(5)
        {
            var consolidatedRanges = new List<Range<char>>();
            foreach(var range in ranges)
                range.Switch(
                    characters =>
                    {
                        foreach(var character in characters)
                            consolidatedRanges.Add(new Range<char>(character, character));
                    },
                    range => consolidatedRanges.Add(new Range<char>(range.Start, range.End)),
                    null);
            Ranges = consolidatedRanges;
        }

        public CharacterSet(
            IList<Range<char>> ranges
            ) : base(5)
        {
            Ranges = ranges.AsReadOnly();
        }

        public CharacterSet(
            string characters
            ) : base(5)
        {
            Ranges = characters.Select(character => new Range<char>(character, character)).ToList();
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            if(position >= input.Length)
                return NoMatch(position);

            if(Ranges.Any(range => range.Contains(input[position])))
            {
                Match?.Invoke(
                   this,
                   input,
                   position,
                   1);

                return 1;
            }

            return NoMatch(position);
        }

        public override Node Parse2(
            string input,
            int    position
            )
        {
            var match = position < input.Length && Ranges.Any(range => range.Contains(input[position]));

            return new Node(
                this,
                input,
                position,
                match ? 1 : 0,
                match);
        }

        public override IEnumerable<Event> Parse3(
            string input,
            int    position
            )
        {
            var match = position < input.Length && Ranges.Any(range => range.Contains(input[position]));

            yield return new End(
                this,
                input,
                position,
                match ? 1 : 0,
                match);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }

    public class Dot: Expression
    {
        public Dot() : base(5)
        {
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            if(position >= input.Length)
                return NoMatch(position);

            Match?.Invoke(
               this,
               input,
               position,
               1);

            return 1;
        }

        public override Node Parse2(
            string input,
            int    position
            )
        {
            var match = position < input.Length;

            return new Node(
                this,
                input,
                position,
                match ? 1 : 0,
                match);
        }

        public override IEnumerable<Event> Parse3(
            string input,
            int    position
            )
        {
            var match = position < input.Length;

            yield return new End(
                this,
                input,
                position,
                match ? 1 : 0,
                match);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}

using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Peg
{
    public class CharacterSet: Expression
    {
        public IReadOnlyList<Union<char[], Range<char>>> Subsets { get; private set; }

        public CharacterSet(
            params Union<char[], Range<char>>[] subsets
            ) : base(5)
        {
            Subsets = subsets;
        }

        public CharacterSet(
            string characters
            ) : base(5)
        {
            Subsets = new List<Union<char[], Range<char>>> { characters.ToCharArray() };
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            if(position >= input.Length)
                return NoMatch(position);

            if(Subsets.Any(
                subset => subset.Switch(
                    characters => characters.Contains(input[position]),
                    range      => range.Contains(input[position]),
                    null)))
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
            var node = new Node(
                this,
                input,
                position);

            node.Match = position < input.Length && Subsets.Any(
                subset => subset.Switch(
                    characters => characters.Contains(input[position]),
                    range => range.Contains(input[position]),
                    null));

            if(node.Match)
                node.Length = 1;

            return node;
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }

    public class CharacterSetComplement: Expression
    {
        public IReadOnlyList<Union<char[], Range<char>>> Subsets { get; private set; }

        public CharacterSetComplement(
            params Union<char[], Range<char>>[] subsets
            ) : base(5)
        {
            Subsets = subsets;
        }

        public CharacterSetComplement(
            string characters
            ) : base(5)
        {
            Subsets = new List<Union<char[], Range<char>>> { characters.ToCharArray() };
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            if(position >= input.Length)
                return NoMatch(position);

            if(!Subsets.Any(
                subset => subset.Switch(
                    characters => characters.Contains(input[position]),
                    range      => range.Contains(input[position]),
                    null)))
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
            var node = new Node(
                this,
                input,
                position);

            node.Match = position < input.Length && !Subsets.Any(
                subset => subset.Switch(
                    characters => characters.Contains(input[position]),
                    range => range.Contains(input[position]),
                    null));

            if(node.Match)
                node.Length = 1;

            return node;
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
            var node = new Node(
                this,
                input,
                position);

            node.Match = position < input.Length;

            if(node.Match)
                node.Length = 1;

            return node;
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}

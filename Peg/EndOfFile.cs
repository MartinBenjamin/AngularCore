using System.Collections.Generic;

namespace Peg
{
    public class EndOfFile: Expression
    {
        public EndOfFile(): base(5)
        {
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            if(position == input.Length)
            {
                Match?.Invoke(
                    this,
                    input,
                    position,
                    0);

                return 0;
            }

            return NoMatch(position);
        }

        public override Node Parse2(
            string input,
            int    position
            ) => new TerminalNode(
                this,
                input,
                position,
                0,
                position == input.Length);

        public override IEnumerable<Event> Parse3(
            string input,
            int    position
            )
        {
            yield return new End(
                this,
                input,
                position,
                0,
                position == input.Length);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
        }
    }
}

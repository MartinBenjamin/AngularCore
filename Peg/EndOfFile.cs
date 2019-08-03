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

        public override void Write(
            IExpressionWriter writer
            )
        {
        }
    }
}

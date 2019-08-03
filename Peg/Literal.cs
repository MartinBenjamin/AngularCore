namespace Peg
{
    public class Literal : Expression
    {
        public string Value { get; private set; }

        public Literal(
            string value
            ) : base(5)
        {
            Value = value;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            if(position + Value.Length <= input.Length &&
               input.Substring(position, Value.Length) == Value)
            {
                Match?.Invoke(
                   this,
                   input,
                   position,
                   Value.Length);

                return Value.Length;
            }

            return NoMatch(position);
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}

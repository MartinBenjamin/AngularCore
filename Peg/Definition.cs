namespace Peg
{
    public class Definition: Expression
    {
        public string     Identifier { get; private set; }

        public Expression Expression { get; set; }

        public Definition(): this(null)
        {
        }

        public Definition(
            string identifier
            ) : base(5)
        {
            Identifier = identifier;
        }

        public override int Parse(
            string input,
            int    position
            )
        {
            var length = Expression.Parse(
                input,
                position);

            if(length >= 0)
                Match?.Invoke(
                    this,
                    input,
                    position,
                    length);

            return length;
        }

        public override void Write(
            IExpressionWriter writer
            )
        {
            writer.Write(this);
        }
    }
}

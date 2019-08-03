using System.Text;

namespace Peg
{
    public class Identifier: Expression
    {
        public string     Name       { get; private set; }

        public Expression Expression { get; set; }

        public Identifier(): this(null)
        {
        }

        public Identifier(
            string name
            ) : base(5)
        {
            Name = name;
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

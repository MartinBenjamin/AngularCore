namespace Peg
{
    public abstract class Event
    {
        public Expression Expression { get; private set; }
        public string     Input      { get; private set; }
        public int        Position   { get; private set; }

        protected Event(
            Expression expression,
            string     input,
            int        position
            )
        {
            Expression = expression;
            Input      = input;
            Position   = position;
        }
    }

    public class Begin: Event
    {
        public Begin(
            Expression expression,
            string     input,
            int        position
            ): base(
                expression,
                input,
                position)
        {
        }
    }

    public class End: Event
    {
        public int  Length { get; private set; }
        public bool Match  { get; private set; }

        public End(
            Expression expression,
            string     input,
            int        position,
            int        length,
            bool       match
            ): base(
                expression,
                input,
                position)
        {
            Length = length;
            Match  = match;
        }
    }
}

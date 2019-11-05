using System;

namespace Expressions
{
    public class Variable<T>: Expression<T>
    {
        public T Value { get; set; }

        protected Variable() : base()
        {
        }

        public Variable(
            Guid id,
            T    value
            ) : base(id)
        {
            Value = value;
        }

        public Variable(
            T value
            ) : this(
                Guid.NewGuid(),
                value)
        {
        }

        public override T Evaluate() => Value;
    }
}

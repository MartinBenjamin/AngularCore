using CommonDomainObjects;
using System;

namespace Expressions
{
    public abstract class Expression<TResult>: DomainObject<Guid>
    {
        protected Expression() : base()
        {
        }

        protected Expression(
            Guid id
            ) : base(id)
        {
        }

        public abstract TResult Evaluate();
    }

    public abstract class Expression<T, TResult>: DomainObject<Guid>
    {
        protected Expression() : base()
        {
        }

        protected Expression(
            Guid id
            ) : base(id)
        {
        }

        public abstract TResult Evaluate(T t);
    }
}

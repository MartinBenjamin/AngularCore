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

    public abstract class Function<T, TResult>: DomainObject<Guid>
    {
        protected Function() : base()
        {
        }

        protected Function(
            Guid id
            ) : base(id)
        {
        }

        public abstract TResult Evaluate(T t);
    }
}

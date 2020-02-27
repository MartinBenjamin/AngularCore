using CommonDomainObjects;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Expressions
{
    public abstract class Enumerable<TId, T>:
        DomainObject<TId>,
        IEnumerable<T>
    {
        protected Enumerable() : base()
        {
        }

        protected Enumerable(
            TId id
            ) : base(id)
        {
        }

        public abstract IEnumerator<T> GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator()
        {
            throw new NotImplementedException();
        }
    }

    public abstract class Selection<TId, TResult, TSource>: Enumerable<TId, TResult>
    {
        private Enumerable<TId, TSource> _source;
        private Func<TSource, TResult>   _selector;

        protected Selection() : base()
        {
        }

        protected Selection(
            TId                      id,
            Enumerable<TId, TSource> source,
            Func<TSource, TResult>   selector
            ) : base(id)
        {
            _source   = source;
            _selector = selector;
        }

        public override IEnumerator<TResult> GetEnumerator()
        {
            return _source.Select(_selector).GetEnumerator();
        }
    }
}

using CommonDomainObjects;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Expressions
{
    public abstract class Enumerable<TEnumerableId, T>:
        DomainObject<TEnumerableId>,
        IEnumerable<T>
    {
        protected Enumerable() : base()
        {
        }

        protected Enumerable(
            TEnumerableId id
            ) : base(id)
        {
        }

        public abstract IEnumerator<T> GetEnumerator();

        IEnumerator IEnumerable.GetEnumerator()
        {
            throw new NotImplementedException();
        }
    }

    public abstract class Selection<TEnumerableId, T, U>: Enumerable<TEnumerableId, T>
    {
        private Enumerable<TEnumerableId, U> _source;
        private Func<U, T>                   _selector;

        protected Selection() : base()
        {
        }

        protected Selection(
            TEnumerableId                id,
            Enumerable<TEnumerableId, U> source,
            Func<U, T>                   selector
            ) : base()
        {
            _source   = source;
            _selector = selector;
        }

        public override IEnumerator<T> GetEnumerator()
        {
            return (from u in _source select _selector(u)).GetEnumerator();
        }
    }
}

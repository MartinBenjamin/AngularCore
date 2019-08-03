using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace CommonDomainObjects
{
    public abstract class Taxonomy<TId, TTaxonomy, TTaxonomyTerm, TTerm>: DomainObject<TId>
        where TTaxonomy : Taxonomy<TId, TTaxonomy, TTaxonomyTerm, TTerm>
        where TTaxonomyTerm : TaxonomyTerm<TId, TTaxonomy, TTaxonomyTerm, TTerm>
    {
        private IList<TTaxonomyTerm> _terms;

        public virtual IReadOnlyList<TTaxonomyTerm> Terms
        {
            get
            {
                return new ReadOnlyCollection<TTaxonomyTerm>(_terms);
            }
        }

        protected Taxonomy() : base()
        {
        }

        public Taxonomy(
            TId                              id,
            IDictionary<TTerm, IList<TTerm>> hierachy
            ) : base(id)
        {
            _terms = new List<TTaxonomyTerm>();

            foreach(var term in hierachy.TopologicalSort())
            {
                TTaxonomyTerm broaderTaxonomyTerm = null;

                var adjacent = hierachy[term];

                if(adjacent.Count > 0)
                {
                    var broaderTerm = adjacent.First();
                    broaderTaxonomyTerm = _terms.FirstOrDefault(taxonomyTerm => taxonomyTerm.Term.Equals(broaderTerm));
                }

                _terms.Add(
                    NewTaxonomyTerm(
                        term,
                        broaderTaxonomyTerm));
            }

            AssignIntervals();
        }

        public virtual TTaxonomyTerm this[
            TTerm term
            ]
        {
            get
            {
                return _terms.FirstOrDefault(taxonomyTerm => taxonomyTerm.Term.Equals(term));
            }
        }

        private void AssignIntervals()
        {
            var next = 0;

            Terms
                .Where(term => term.Broader == null)
                .ToList()
                .ForEach(term => next = term.AssignInterval(next));
        }

        public virtual void Visit(
            Action<TTaxonomyTerm> before,
            Action<TTaxonomyTerm> after = null
            )
        {
            Terms
                .Where(term => term.Broader == null)
                .ToList()
                .ForEach(term => term.Visit(
                    before,
                    after));
        }

        protected abstract TTaxonomyTerm NewTaxonomyTerm(
            TTerm         term,
            TTaxonomyTerm broaderTerm);
    }

    public abstract class TaxonomyTerm<TId, TTaxonomy, TTaxonomyTerm, TTerm>: DomainObject<TId>
        where TTaxonomy : Taxonomy<TId, TTaxonomy, TTaxonomyTerm, TTerm>
        where TTaxonomyTerm : TaxonomyTerm<TId, TTaxonomy, TTaxonomyTerm, TTerm>
    {
        private IList<TTaxonomyTerm> _narrower;

        public virtual TTaxonomy     Taxonomy { get; protected set; }
        public virtual TTerm         Term     { get; protected set; }
        public virtual TTaxonomyTerm Broader  { get; protected set; }
        public virtual Range<int>    Interval { get; protected set; }

        public virtual IReadOnlyList<TTaxonomyTerm> Narrower
        {
            get
            {
                return new ReadOnlyCollection<TTaxonomyTerm>(_narrower);
            }
        }

        protected TaxonomyTerm() : base()
        {
        }

        internal TaxonomyTerm(
            TId           id,
            TTaxonomy     taxonomy,
            TTerm         term,
            TTaxonomyTerm broader
            ) : base(id)
        {
            _narrower = new List<TTaxonomyTerm>();
            Taxonomy  = taxonomy;
            Term      = term;
            Broader   = broader;
            Broader?._narrower.Add((TTaxonomyTerm)this);
        }

        public virtual bool Contains(
            TTaxonomyTerm taxonomyTerm
            )
        {
            return Interval.Contains(taxonomyTerm.Interval);
        }

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var narrower in _narrower)
                next = narrower.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        public virtual void Visit(
            Action<TTaxonomyTerm> before,
            Action<TTaxonomyTerm> after = null
            )
        {
            before?.Invoke((TTaxonomyTerm)this);

            foreach(var narrower in Narrower)
                narrower.Visit(
                    before,
                    after);

            after?.Invoke((TTaxonomyTerm)this);
        }
    }

    public class Taxonomy<TTerm>: Taxonomy<Guid, Taxonomy<TTerm>, TaxonomyTerm<TTerm>, TTerm>
    {
        protected Taxonomy() : base()
        {
        }

        public Taxonomy(
            Guid                             id,
            IDictionary<TTerm, IList<TTerm>> hierachy
            ) : base(
                id,
                hierachy)
        {
        }

        public Taxonomy(
            IDictionary<TTerm, IList<TTerm>> hierachy
            ) : this(
                Guid.NewGuid(),
                hierachy)
        {
        }

        protected override TaxonomyTerm<TTerm> NewTaxonomyTerm(
            TTerm               term,
            TaxonomyTerm<TTerm> broaderTerm
            )
        {
            return new TaxonomyTerm<TTerm>(
                this,
                term,
                broaderTerm);
        }
    }

    public class TaxonomyTerm<TTerm>: TaxonomyTerm<Guid, Taxonomy<TTerm>, TaxonomyTerm<TTerm>, TTerm>
    {
        protected TaxonomyTerm() : base()
        {
        }

        internal TaxonomyTerm(
            Taxonomy<TTerm>     taxonomy,
            TTerm               term,
            TaxonomyTerm<TTerm> broader
            ) : base(
                Guid.NewGuid(),
                taxonomy,
                term,
                broader)
        {
        }
    }
}

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public abstract class Taxonomy<TId, TTaxonomy, TTaxonomyTerm, TTerm>: DomainObject<TId>
        where TTaxonomy : Taxonomy<TId, TTaxonomy, TTaxonomyTerm, TTerm>
        where TTaxonomyTerm : TaxonomyTerm<TId, TTaxonomy, TTaxonomyTerm, TTerm>
    {
        private IList<TTaxonomyTerm> _terms;

        public virtual IReadOnlyList<TTaxonomyTerm> Terms
            => new ReadOnlyCollection<TTaxonomyTerm>(_terms);

        protected Taxonomy() : base()
        {
        }

        public Taxonomy(
            TId                              id,
            IDictionary<TTerm, IList<TTerm>> adjacencyList
            ) : base(id)
        {
            _terms = new List<TTaxonomyTerm>();

            var next = 0;
            foreach(var term in adjacencyList.Keys.Where(key => adjacencyList[key].Count == 0))
            {
                var taxonomyTerm = CreateTree(
                    adjacencyList.Transpose(),
                    term,
                    null);

                next = taxonomyTerm.AssignInterval(next);
            }
        }

        public virtual TTaxonomyTerm this[
            TTerm term
            ] => _terms.FirstOrDefault(taxonomyTerm => taxonomyTerm.Term.Equals(term));

        public virtual void Visit(
            Action<TTaxonomyTerm> enter,
            Action<TTaxonomyTerm> exit = null
            ) => Terms
                .Where(taxonomyTerm => taxonomyTerm.Broader == null)
                .ForEach(taxonomyTerm => taxonomyTerm.Visit(
                    enter,
                    exit));

        public virtual async Task VisitAsync(
            Func<TTaxonomyTerm, Task> enter,
            Func<TTaxonomyTerm, Task> exit = null
            ) => await Terms
                .Where(taxonomyTerm => taxonomyTerm.Broader == null)
                .ForEachAsync(taxonomyTerm => taxonomyTerm.VisitAsync(
                    enter,
                    exit));

        private TTaxonomyTerm CreateTree(
            IDictionary<TTerm, IList<TTerm>> adjacencyList,
            TTerm                            term,
            TTaxonomyTerm                    broaderTaxonomyTerm
            )
        {
            var taxonomyTerm = NewTaxonomyTerm(
                term,
                broaderTaxonomyTerm);

            _terms.Add(taxonomyTerm);

            foreach(var narrower in adjacencyList[term])
                CreateTree(
                    adjacencyList,
                    narrower,
                    taxonomyTerm);

            return taxonomyTerm;
        }

        protected abstract TTaxonomyTerm NewTaxonomyTerm(
            TTerm         term,
            TTaxonomyTerm broaderTaxonomyTerm);
    }

    public abstract class TaxonomyTerm<TId, TTaxonomy, TTaxonomyTerm, TTerm>:
        DomainObject<TId>,
        ITreeVertex<TTaxonomyTerm>
        where TTaxonomy : Taxonomy<TId, TTaxonomy, TTaxonomyTerm, TTerm>
        where TTaxonomyTerm : TaxonomyTerm<TId, TTaxonomy, TTaxonomyTerm, TTerm>
    {
        private IList<TTaxonomyTerm> _narrower;

        public virtual TTaxonomy     Taxonomy { get; protected set; }
        public virtual TTerm         Term     { get; protected set; }
        public virtual TTaxonomyTerm Broader  { get; protected set; }
        public virtual Range<int>    Interval { get; protected set; }

        public virtual IReadOnlyList<TTaxonomyTerm> Narrower
            => new ReadOnlyCollection<TTaxonomyTerm>(_narrower);

        protected TaxonomyTerm() : base()
        {
        }

        protected TaxonomyTerm(
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
            ) =>
                Taxonomy == taxonomyTerm.Taxonomy &&
                Interval.Contains(taxonomyTerm.Interval);

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            _narrower.ForEach(narrower => next = narrower.AssignInterval(next));

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        TTaxonomyTerm ITreeVertex<TTaxonomyTerm>.Parent => Broader;

        IReadOnlyList<TTaxonomyTerm> ITreeVertex<TTaxonomyTerm>.Children => Narrower;
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
            TaxonomyTerm<TTerm> broaderTaxonomyTerm
            ) => new TaxonomyTerm<TTerm>(
                this,
                term,
                broaderTaxonomyTerm);
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

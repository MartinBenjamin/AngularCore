using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace CommonDomainObjects
{
    public class Hierarchy: DomainObject<Guid>
    {
        private IList<HierarchyOrganisation> _organisations;

        public virtual IReadOnlyList<HierarchyOrganisation> Organisations
        {
            get
            {
                return new ReadOnlyCollection<HierarchyOrganisation>(_organisations);
            }
        }

        protected Hierarchy() : base()
        {
        }

        public Hierarchy(
            IDictionary<Organisation, IList<Organisation>> hierachy
            ) : base(Guid.NewGuid())
        {
            _organisations = new List<HierarchyOrganisation>();

            foreach(var organisation in hierachy.TopologicalSort())
            {
                HierarchyOrganisation parentHierarchyOrganisation = null;

                var adjacent = hierachy[organisation];

                if(adjacent.Count > 0)
                {
                    var parentOrganisation = adjacent.First();
                    parentHierarchyOrganisation = _organisations
                        .FirstOrDefault(hierarchyOrganisation => hierarchyOrganisation.Organisation == parentOrganisation);
                }

                _organisations.Add(
                    new HierarchyOrganisation(
                        this,
                        organisation,
                        parentHierarchyOrganisation));
            }

            AssignIntervals();
        }

        public HierarchyOrganisation this[
            Organisation organisation
            ]
        {
            get
            {
                return _organisations.FirstOrDefault(
                    hierarchyOrganisation => hierarchyOrganisation.Organisation.Equals(organisation));
            }
        }

        private void AssignIntervals()
        {
            var next = 0;

            Organisations
                .Where(term => term.Parent == null)
                .ToList()
                .ForEach(term => next = term.AssignInterval(next));
        }
    }

    public class HierarchyOrganisation: DomainObject<Guid>
    {
        private IList<HierarchyOrganisation> _children;

        public virtual Hierarchy             Hierarchy    { get; protected set; }
        public virtual Organisation          Organisation { get; protected set; }
        public virtual HierarchyOrganisation Parent       { get; protected set; }
        public virtual Range<int>            Interval     { get; protected set; }

        public virtual IReadOnlyList<HierarchyOrganisation> Children
        {
            get
            {
                return new ReadOnlyCollection<HierarchyOrganisation>(_children);
            }
        }

        protected HierarchyOrganisation() : base()
        {
        }

        internal HierarchyOrganisation(
            Hierarchy             hierarchy,
            Organisation          organisation,
            HierarchyOrganisation parent
            ) : base(Guid.NewGuid())
        {
            _children = new List<HierarchyOrganisation>();
            Hierarchy    = hierarchy;
            Organisation = organisation;
            Parent       = parent;
            Parent?._children.Add(this);
        }

        public virtual bool Contains(
            HierarchyOrganisation hierarchyOrganisation
            )
        {
            return Interval.Contains(hierarchyOrganisation.Interval);
        }

        protected internal int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var child in _children)
                next = child.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        public virtual void Visit(
            Action<HierarchyOrganisation> before,
            Action<HierarchyOrganisation> after = null
            )
        {
            before?.Invoke(this);

            foreach(var child in Children)
                child.Visit(
                    before,
                    after);

            after?.Invoke(this);
        }
    }
}

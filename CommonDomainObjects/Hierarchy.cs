using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public abstract class Hierarchy<TId, THierarchy, THierarchyMember, TMember>: DomainObject<TId>
        where THierarchy : Hierarchy<TId, THierarchy, THierarchyMember, TMember>
        where THierarchyMember : HierarchyMember<TId, THierarchy, THierarchyMember, TMember>
    {
        private IList<THierarchyMember> _members;

        public virtual IReadOnlyList<THierarchyMember> Members
        {
            get
            {
                return new ReadOnlyCollection<THierarchyMember>(_members);
            }
        }

        protected Hierarchy() : base()
        {
        }

        public Hierarchy(
            TId                                  id,
            IDictionary<TMember, IList<TMember>> hierachy
            ) : base(id)
        {
            _members = new List<THierarchyMember>();

            foreach(var member in hierachy.TopologicalSort())
            {
                THierarchyMember parentHierarchyMember = null;

                var adjacent = hierachy[member];

                if(adjacent.Count > 0)
                {
                    var parent = adjacent.First();
                    parentHierarchyMember = _members.FirstOrDefault(hierarchyMember => hierarchyMember.Member.Equals(parent));
                }

                _members.Add(
                    NewHierarchyMember(
                        member,
                        parentHierarchyMember));
            }

            AssignIntervals();
        }

        public virtual THierarchyMember this[
            TMember member
            ]
        {
            get
            {
                return _members.FirstOrDefault(hierarchyMember => hierarchyMember.Member.Equals(member));
            }
        }

        private void AssignIntervals()
        {
            var next = 0;

            Members
                .Where(hierarchyMember => hierarchyMember.Parent == null)
                .ToList()
                .ForEach(hierarchyMember => next = hierarchyMember.AssignInterval(next));
        }

        public virtual void Visit(
            Action<THierarchyMember> enter,
            Action<THierarchyMember> exit = null
            )
        {
            Members
                .Where(hierarchyMember => hierarchyMember.Parent == null)
                .ToList()
                .ForEach(hierarchyMember => hierarchyMember.Visit(
                    enter,
                    exit));
        }

        public virtual async Task VisitAsync(
            Func<THierarchyMember, Task> enter,
            Func<THierarchyMember, Task> exit = null
            )
        {
            foreach(var currentHierarchyMember in Members.Where(hierarchyMember => hierarchyMember.Parent == null))
                await currentHierarchyMember.VisitAsync(
                    enter,
                    exit);
        }

        protected abstract THierarchyMember NewHierarchyMember(
            TMember          member,
            THierarchyMember parentHierarchyMember);
    }

    public abstract class HierarchyMember<TId, THierarchy, THierarchyMember, TMember>:
        DomainObject<TId>,
        ITreeVertex<THierarchyMember>
        where THierarchy : Hierarchy<TId, THierarchy, THierarchyMember, TMember>
        where THierarchyMember : HierarchyMember<TId, THierarchy, THierarchyMember, TMember>
    {
        private IList<THierarchyMember> _children;

        public virtual THierarchy       Hierarchy { get; protected set; }
        public virtual TMember          Member    { get; protected set; }
        public virtual THierarchyMember Parent    { get; protected set; }
        public virtual Range<int>       Interval  { get; protected set; }

        public virtual IReadOnlyList<THierarchyMember> Children
        {
            get
            {
                return new ReadOnlyCollection<THierarchyMember>(_children);
            }
        }

        protected HierarchyMember() : base()
        {
        }

        protected HierarchyMember(
            TId              id,
            THierarchy       hierarchy,
            TMember          member,
            THierarchyMember parent
            ) : base(id)
        {
            _children = new List<THierarchyMember>();
            Hierarchy = hierarchy;
            Member    = member;
            Parent    = parent;
            Parent?._children.Add((THierarchyMember)this);
        }

        public virtual bool Contains(
            THierarchyMember hierarchyMember
            )
        {
            return Interval.Contains(hierarchyMember.Interval);
        }

        protected internal virtual int AssignInterval(
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
    }

    public class Hierarchy<TMember>: Hierarchy<Guid, Hierarchy<TMember>, HierarchyMember<TMember>, TMember>
    {
        protected Hierarchy() : base()
        {
        }

        public Hierarchy(
            Guid                                 id,
            IDictionary<TMember, IList<TMember>> hierachy
            ) : base(
                id,
                hierachy)
        {
        }

        public Hierarchy(
            IDictionary<TMember, IList<TMember>> hierachy
            ) : this(
                Guid.NewGuid(),
                hierachy)
        {
        }

        protected override HierarchyMember<TMember> NewHierarchyMember(
            TMember                  member,
            HierarchyMember<TMember> parentHierarchyMember
            )
        {
            return new HierarchyMember<TMember>(
                this,
                member,
                parentHierarchyMember);
        }
    }

    public class HierarchyMember<TMember>: HierarchyMember<Guid, Hierarchy<TMember>, HierarchyMember<TMember>, TMember>
    {
        protected HierarchyMember() : base()
        {
        }

        internal HierarchyMember(
            Hierarchy<TMember>       hierarchy,
            TMember                  member,
            HierarchyMember<TMember> parent
            ) : base(
                Guid.NewGuid(),
                hierarchy,
                member,
                parent)
        {
        }
    }
}

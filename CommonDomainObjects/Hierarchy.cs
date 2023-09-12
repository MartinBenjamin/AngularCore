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
            => new ReadOnlyCollection<THierarchyMember>(_members);

        protected Hierarchy() : base()
        {
        }

        public Hierarchy(
            TId                                  id,
            IDictionary<TMember, IList<TMember>> child
            ) : base(id)
        {
            _members = new List<THierarchyMember>();

            var parent = child.Transpose();

            var next = 0;
            foreach(var member in parent.Keys.Where(key => parent[key].Count == 0))
            {
                var hierarchyMember = CreateTree(
                    child,
                    member,
                    null);

                next = hierarchyMember.AssignInterval(next);
            }
        }

        public virtual THierarchyMember this[
            TMember member
            ] => _members.FirstOrDefault(hierarchyMember => hierarchyMember.Member.Equals(member));

        public virtual void Visit(
            Action<THierarchyMember> enter,
            Action<THierarchyMember> exit = null
            ) => Members
                .Where(hierarchyMember => hierarchyMember.Parent == null)
                .ForEach(hierarchyMember => hierarchyMember.Visit(
                    enter,
                    exit));

        public virtual async Task VisitAsync(
            Func<THierarchyMember, Task> enter,
            Func<THierarchyMember, Task> exit = null
            ) => await Members
                .Where(hierarchyMember => hierarchyMember.Parent == null)
                .ForEachAsync(hierarchyMember => hierarchyMember.VisitAsync(
                    enter,
                    exit));

        private THierarchyMember CreateTree(
            IDictionary<TMember, IList<TMember>> child,
            TMember                              member,
            THierarchyMember                     parentHierarchyMember
            )
        {
            var hierarchyMember = NewHierarchyMember(
                member,
                parentHierarchyMember);

            _members.Add(hierarchyMember);

            foreach(var childMember in child[member])
                CreateTree(
                    child,
                    childMember,
                    hierarchyMember);

            return hierarchyMember;
        }

        protected abstract THierarchyMember NewHierarchyMember(
            TMember          member,
            THierarchyMember parent);
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
            => new ReadOnlyCollection<THierarchyMember>(_children);

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
            ) =>
                Hierarchy == hierarchyMember.Hierarchy &&
                Interval.Contains(hierarchyMember.Interval);

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
            IDictionary<TMember, IList<TMember>> parent
            ) : base(
                id,
                parent)
        {
        }

        public Hierarchy(
            IDictionary<TMember, IList<TMember>> parent
            ) : this(
                Guid.NewGuid(),
                parent)
        {
        }

        protected override HierarchyMember<TMember> NewHierarchyMember(
            TMember                  member,
            HierarchyMember<TMember> parent
            ) => new HierarchyMember<TMember>(
                this,
                member,
                parent);
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

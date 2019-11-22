using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Organisations
{
    public class Hierarchy: Hierarchy<Guid, Hierarchy, HierarchyMember, Organisation>
    {
        protected Hierarchy() : base()
        {
        }

        public Hierarchy(
            IDictionary<Organisation, IList<Organisation>> hierachy
            ) : base(
                Guid.NewGuid(),
                hierachy)
        {
        }

        protected override HierarchyMember NewHierarchyMember(
            Organisation    organisation,
            HierarchyMember parentHierarchyMember
            )
        {
            return new HierarchyMember(
                this,
                organisation,
                parentHierarchyMember);
        }
    }

    public class HierarchyMember: HierarchyMember<Guid, Hierarchy, HierarchyMember, Organisation>
    {
        protected HierarchyMember() : base()
        {
        }

        internal HierarchyMember(
            Hierarchy       hierarchy,
            Organisation    organisation,
            HierarchyMember parent
            ) : base(
                Guid.NewGuid(),
                hierarchy,
                organisation,
                parent)
        {
        }
    }
}

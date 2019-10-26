using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Geophysical
{
    public class GeographicalAreaHierarchy: Hierarchy<Guid, GeographicalAreaHierarchy, GeographicalAreaHierarchyMember, GeographicalArea>
    {
        protected GeographicalAreaHierarchy() : base()
        {
        }

        public GeographicalAreaHierarchy(
            IDictionary<GeographicalArea, IList<GeographicalArea>> hierachy
            ) : base(
                Guid.NewGuid(),
                hierachy)
        {
        }

        protected override GeographicalAreaHierarchyMember NewHierarchyMember(
            GeographicalArea                geographicalArea,
            GeographicalAreaHierarchyMember parentHierarchyMember
            )
        {
            return new GeographicalAreaHierarchyMember(
                this,
                geographicalArea,
                parentHierarchyMember);
        }
    }

    public class GeographicalAreaHierarchyMember: HierarchyMember<Guid, GeographicalAreaHierarchy, GeographicalAreaHierarchyMember, GeographicalArea>
    {
        protected GeographicalAreaHierarchyMember() : base()
        {
        }

        internal GeographicalAreaHierarchyMember(
            GeographicalAreaHierarchy       hierarchy,
            GeographicalArea                geographicalArea,
            GeographicalAreaHierarchyMember parent
            ) : base(
                Guid.NewGuid(),
                hierarchy,
                geographicalArea,
                parent)
        {
        }
    }
}

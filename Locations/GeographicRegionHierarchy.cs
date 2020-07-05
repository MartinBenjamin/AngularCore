using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Locations
{
    public class GeographicRegionHierarchy: Hierarchy<Guid, GeographicRegionHierarchy, GeographicRegionHierarchyMember, GeographicRegion>
    {
        protected GeographicRegionHierarchy() : base()
        {
        }

        public GeographicRegionHierarchy(
            Guid                                                   id,
            IDictionary<GeographicRegion, IList<GeographicRegion>> parent
            ) : base(
                id,
                parent)
        {
        }

        public GeographicRegionHierarchy(
            IDictionary<GeographicRegion, IList<GeographicRegion>> parent
            ) : this(
                Guid.NewGuid(),
                parent)
        {
        }

        protected override GeographicRegionHierarchyMember NewHierarchyMember(
            GeographicRegion                geographicalRegion,
            GeographicRegionHierarchyMember parentHierarchyMember
            )
        {
            return new GeographicRegionHierarchyMember(
                this,
                geographicalRegion,
                parentHierarchyMember);
        }
    }

    public class GeographicRegionHierarchyMember: HierarchyMember<Guid, GeographicRegionHierarchy, GeographicRegionHierarchyMember, GeographicRegion>
    {
        protected GeographicRegionHierarchyMember() : base()
        {
        }

        internal GeographicRegionHierarchyMember(
            GeographicRegionHierarchy       hierarchy,
            GeographicRegion                geographicRegion,
            GeographicRegionHierarchyMember parent
            ) : base(
                Guid.NewGuid(),
                hierarchy,
                geographicRegion,
                parent)
        {
        }
    }
}

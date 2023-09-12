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
            IDictionary<GeographicRegion, IList<GeographicRegion>> child
            ) : base(
                id,
                child)
        {
        }

        public GeographicRegionHierarchy(
            IDictionary<GeographicRegion, IList<GeographicRegion>> child
            ) : this(
                Guid.NewGuid(),
                child)
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

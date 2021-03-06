﻿using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Geophysical
{
    public class GeographicRegionHierarchy: Hierarchy<Guid, GeographicRegionHierarchy, GeographicRegionHierarchyMember, GeographicRegion>
    {
        protected GeographicRegionHierarchy() : base()
        {
        }

        public GeographicRegionHierarchy(
            IDictionary<GeographicRegion, IList<GeographicRegion>> hierachy
            ) : base(
                Guid.NewGuid(),
                hierachy)
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

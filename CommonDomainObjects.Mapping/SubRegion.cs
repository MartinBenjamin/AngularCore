﻿using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    class SubRegion: SubclassMapping<UnsdM49.SubRegion>
    {
        public SubRegion()
        {
            DiscriminatorValue(nameof(UnsdM49.SubRegion));
        }
    }
}

﻿using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Organisation: JoinedSubclassMapping<Organisations.Organisation>
    {
        public Organisation()
        {
        }
    }
}

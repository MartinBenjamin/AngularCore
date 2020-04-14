using LegalEntities;
using NHibernate;
using System;

namespace Service
{
    public class LegalEntityService: NamedService<Guid, LegalEntity, NamedFilters>
    {
        public LegalEntityService(
            ISession session
            ): base(session)
        {
        }

        protected override ICriteria CreateCriteria(
            ISession session
            )
        {
            var criteria = base.CreateCriteria(session);
            criteria.Fetch("Country");
            return criteria;
        }
    }
}

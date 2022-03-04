using NHibernate;
using System;

namespace Data
{
    public class FacilityFeeTypeLoader: FeeTypeLoader
    {
        public FacilityFeeTypeLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ): base(
            csvExtractor,
            sessionFactory,
            new Guid("d0439195-f8ed-43d7-8313-71f1c58648cd"),
            "FacilityFeeType.csv")
        {
        }
    }
}

using NHibernate;
using System;

namespace Data
{
    public class OtherFeeTypeLoader: FeeTypeLoader
    {
        public OtherFeeTypeLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
            csvExtractor,
            sessionFactory,
            new Guid("c4c62970-1962-4a56-9ca7-812820e23b14"),
            "OtherFeeType.csv")
        {
        }
    }
}

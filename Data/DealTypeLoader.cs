using CommonDomainObjects;
using Deals;
using NHibernate;
using System;

namespace Data
{
    public class DealTypeLoader: ClassificationSchemeLoader
    {
        public DealTypeLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
                csvExtractor,
                sessionFactory,
                new Guid("e28b89e1-97e4-4820-aabc-af31e6959888"),
                "DealType.csv")
        {
        }

        protected override Classifier NewClassifier(
            Guid   id,
            string name
            ) => new DealType(
                id,
                name);
    }
}

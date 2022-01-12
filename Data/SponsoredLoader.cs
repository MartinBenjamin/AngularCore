using CommonDomainObjects;
using Deals;
using NHibernate;
using System;

namespace Data
{
    public class SponsoredLoader: ClassificationSchemeLoader
    {
        public SponsoredLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
                csvExtractor,
                sessionFactory,
                new Guid("3110ec17-e5d1-430d-ba95-7aedfddd2358"),
                "Sponsored.csv")
        {
        }

        protected override Classifier NewClassifier(
            Guid   id,
            string name
            ) => new SponsoredClassifier(
                id,
                name);
    }
}

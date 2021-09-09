using CommonDomainObjects;
using Deals;
using NHibernate;
using System;

namespace Data
{
    public class RestrictedLoader: ClassificationSchemeLoader
    {
        public RestrictedLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
                csvExtractor,
                sessionFactory,
                new Guid("10414c1c-da0c-44f0-be02-7f70fe1b8649"),
                "Restricted.csv")
        {
        }

        protected override Classifier NewClassifier(
            Guid   id,
            string name
            ) => new RestrictedClassifier(
                id,
                name);
    }
}

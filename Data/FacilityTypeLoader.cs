using CommonDomainObjects;
using FacilityAgreements;
using NHibernate;
using System;

namespace Data
{
    public class FacilityTypeLoader: ClassificationSchemeLoader
    {
        public FacilityTypeLoader(
            ICsvExtractor csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
                csvExtractor,
                sessionFactory,
                new Guid("a007e4e2-d910-4cf7-af26-8e07901cce79"),
                "FacilityType.csv")
        {
        }

        protected override Classifier NewClassifier(
            Guid id,
            string name
            ) => new FacilityType(
                id,
                name);
    }
}

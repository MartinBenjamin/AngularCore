using CommonDomainObjects;
using FacilityAgreements;
using NHibernate;
using System;

namespace Data
{
    public abstract class FeeTypeLoader: ClassificationSchemeLoader
    {
        public FeeTypeLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory,
            Guid            id,
            string          fileName
            ) : base(
                csvExtractor,
                sessionFactory,
                id,
                fileName)
        {
        }

        protected override Classifier NewClassifier(
            Guid id,
            string name
            ) => new FeeType(
                id,
                name);
    }
}

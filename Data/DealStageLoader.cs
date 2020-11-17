using CommonDomainObjects;
using LifeCycles;
using NHibernate;
using System;

namespace Data
{
    public class DealStageLoader: ClassificationSchemeLoader
    {
        public DealStageLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
                csvExtractor,
                sessionFactory,
                new Guid("947b1353-bd48-4f36-a934-a03a942aaae2"),
                "DealStage.csv")
        {
        }

        protected override Classifier NewClassifier(
            Guid   id,
            string name
            ) => new LifeCycleStage(
                id,
                name);
    }
}

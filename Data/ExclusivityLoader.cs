using CommonDomainObjects;
using Deals;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class ExclusivityLoader: IEtl<ClassificationScheme>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public ExclusivityLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<ClassificationScheme> IEtl<ClassificationScheme>.ExecuteAsync()
        {
            var classes = await _csvExtractor.ExtractAsync(
                "Exclusivity.csv",
                record => (
                    Classifier: (Classifier)new ExclusivityClassifier(
                        record[0] != string.Empty ? new Guid(record[0]) : Guid.NewGuid(),
                        record[2]),
                    SuperClassifierId: record[1] != string.Empty ? new Guid(record[1]) : Guid.Empty));

            var super = (
                from tuple in classes
                join superTuple in classes on tuple.SuperClassifierId equals superTuple.Classifier.Id into superTuples
                select
                (
                    tuple.Classifier,
                    SuperClassifier: (IList<Classifier>)superTuples.Select(t => t.Classifier).ToList()
                )).ToDictionary(
                    tuple => tuple.Classifier,
                    tuple => tuple.SuperClassifier);

            var classificationScheme = new ClassificationScheme(
                new Guid("f7c20b62-ffe8-4c20-86b4-e5c68ba2469d"),
                super);
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session.SaveAsync(classificationScheme);
                await classificationScheme.VisitAsync(
                    async classificationSchemeClassifier =>
                    {
                        await session.SaveAsync(classificationSchemeClassifier.Classifier);
                        await session.SaveAsync(classificationSchemeClassifier);
                    },
                    null);
                await transaction.CommitAsync();
            }

            return classificationScheme;
        }
    }
}

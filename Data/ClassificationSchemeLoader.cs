using CommonDomainObjects;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public abstract class ClassificationSchemeLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly Guid            _classificationSchemeId;
        private readonly string          _fileName;

        public ClassificationSchemeLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory,
            Guid            classificationSchemeId,
            string          fileName
            )
        {
            _csvExtractor           = csvExtractor;
            _sessionFactory         = sessionFactory;
            _classificationSchemeId = classificationSchemeId;
            _fileName               = fileName;
        }

        string IEtl.FileName
        {
            get => _fileName;
        }

        async Task IEtl.ExecuteAsync()
        {
            var classes = await _csvExtractor.ExtractAsync(
                _fileName,
                record => (
                    Classifier: NewClassifier(
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
                _classificationSchemeId,
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
        }

        protected abstract Classifier NewClassifier(
            Guid id,
            string name);
    }
}

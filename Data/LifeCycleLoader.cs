using CommonDomainObjects;
using LifeCycles;
using NHibernate;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class LifeCycleLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private static readonly string _fileName = "DealLifeCycles.csv";

        public LifeCycleLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        string IEtl.FileName
        {
            get => _fileName;
        }

        async Task IEtl.ExecuteAsync()
        {
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session
                    .CreateCriteria<LifeCycleStage>()
                    .ListAsync();

                var records = await _csvExtractor.ExtractAsync(_fileName);

                await (
                    from record in records
                    group session.Get<LifeCycleStage>(new Guid(record[1])) by new Guid(record[0]) into stagesGroupedbyLifeCycle
                    select new LifeCycle(
                        stagesGroupedbyLifeCycle.Key,
                        stagesGroupedbyLifeCycle.ToList())).ForEachAsync(lifeCycle => session.SaveAsync(lifeCycle));

                await transaction.CommitAsync();
            }
        }
    }
}
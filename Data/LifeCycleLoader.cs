using LifeCycles;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class LifeCycleLoader: IEtl<IEnumerable<LifeCycle>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public LifeCycleLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<LifeCycle>> IEtl<IEnumerable<LifeCycle>>.ExecuteAsync()
        {
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session
                    .CreateCriteria<LifeCycleStage>()
                    .ListAsync();

                var records = await _csvExtractor.ExtractAsync(
                    "LifeCycles.csv",
                    record =>
                    (
                        LifeCycleId   : new Guid(record[0]),
                        LifeCycleStage: session.Get<LifeCycleStage>(record[1])
                    ));

                var lifeCycles = (
                    from record in records
                    group record.LifeCycleStage by record.LifeCycleId into stagesGroupedbyLifeCycle
                    select new LifeCycle(
                        stagesGroupedbyLifeCycle.Key,
                        stagesGroupedbyLifeCycle.ToList())).ToList();

                foreach(var lifeCycle in lifeCycles)
                    await session.SaveAsync(lifeCycle);
                await transaction.CommitAsync();

                return lifeCycles;
            }
        }
    }
}
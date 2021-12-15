using LifeCycles;
using NHibernate;
using System;
using System.Collections.Generic;
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

                var records = await _csvExtractor.ExtractAsync(
                    _fileName,
                    record =>
                    (
                        LifeCycleId   : new Guid(record[0]),
                        LifeCycleStage: session.Get<LifeCycleStage>(new Guid(record[1]))
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
            }
        }
    }
}
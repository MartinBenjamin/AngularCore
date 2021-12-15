using CommonDomainObjects;
using FacilityAgreements;
using NHibernate;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class FacilityFeeTypeLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private readonly string _fileName = "FacilityFeeType.csv";

        public FacilityFeeTypeLoader(
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
                await (
                    from record in await _csvExtractor.ExtractAsync(_fileName)
                    select new FacilityFeeType(
                        new Guid(record[0]),
                        record[1])).ForEachAsync(facilityFeeType => session.SaveAsync(facilityFeeType));
                await transaction.CommitAsync();
            }
        }
    }
}

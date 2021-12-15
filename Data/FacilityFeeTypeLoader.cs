using FacilityAgreements;
using NHibernate;
using System;
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
            var facilityFeeTypes = await _csvExtractor.ExtractAsync(
                _fileName,
                record => new FacilityFeeType(
                    new Guid(record[0]),
                    record[1]));

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                foreach(var facilityFeeType in facilityFeeTypes)
                    await session.SaveAsync(facilityFeeType);
                await transaction.CommitAsync();
            }
        }
    }
}

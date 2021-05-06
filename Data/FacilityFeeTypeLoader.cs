using FacilityAgreements;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public class FacilityFeeTypeLoader: IEtl<IEnumerable<FacilityFeeType>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public FacilityFeeTypeLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<FacilityFeeType>> IEtl<IEnumerable<FacilityFeeType>>.ExecuteAsync()
        {
            var facilityFeeTypes = await _csvExtractor.ExtractAsync(
                "FacilityFeeType.csv",
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

            return facilityFeeTypes;
        }
    }
}

using Identifiers;
using NHibernate;
using Organisations;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public class BranchLoader: IEtl<IEnumerable<(Branch, OrganisationIdentifier)>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public BranchLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<(Branch, OrganisationIdentifier)>> IEtl<IEnumerable<(Branch, OrganisationIdentifier)>>.ExecuteAsync()
        {
            var identificationScheme = new IdentificationScheme(
                new Guid("127c6a60-f00c-4cb2-8776-a64544aed5db"),
                "OVS Branch");
            var extracted = await _csvExtractor.ExtractAsync(
                "Branch.csv",
                record =>
                {
                    var branch = new Branch(
                        record[0],
                        null,
                        null);

                    return (
                        branch,
                        new OrganisationIdentifier(
                            identificationScheme,
                            record[1],
                            branch));
                });

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session.SaveAsync(identificationScheme);
                foreach(var (branch, identifier) in extracted)
                {
                    await session.SaveAsync(branch);
                    await session.SaveAsync(identifier);
                }
                await transaction.CommitAsync();
            }

            return extracted;
        }
    }
}

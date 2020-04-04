using Agents;
using NHibernate;
using Organisations;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public class BranchLoader: IEtl<IEnumerable<(Branch, Identifier)>>
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

        async Task<IEnumerable<(Branch, Identifier)>> IEtl<IEnumerable<(Branch, Identifier)>>.ExecuteAsync()
        {
            var identificationScheme = new IdentificationScheme("OVS Branch");
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
                        new Identifier(
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

using Identifiers;
using NHibernate;
using Organisations;
using System;
using System.Threading.Tasks;

namespace Data
{
    public class BranchLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private static string _fileName = "Branch.csv";

        public BranchLoader(
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
            var identificationScheme = new IdentificationScheme(
                new Guid("127c6a60-f00c-4cb2-8776-a64544aed5db"),
                "OVS Branch");
            var records = await _csvExtractor.ExtractAsync(_fileName);

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session.SaveAsync(identificationScheme);
                foreach(var record in records)
                {
                    var branch = new Branch(
                        record[0],
                        null,
                        null);

                    await session.SaveAsync(branch);
                    await session.SaveAsync(
                        new OrganisationIdentifier(
                            identificationScheme,
                            record[1],
                            branch));
                }
                await transaction.CommitAsync();
            }
        }
    }
}

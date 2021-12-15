using NHibernate;
using Roles;
using System;
using System.Threading.Tasks;

namespace Data
{
    public class RoleLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private readonly string _fileName = "Role.csv";

        public RoleLoader(
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
            var roles = await _csvExtractor.ExtractAsync(
                _fileName,
                record => new Role(
                    new Guid(record[0]),
                    record[1]));

            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                foreach(var role in roles)
                    await session.SaveAsync(role);
                await transaction.CommitAsync();
            }
        }
    }
}

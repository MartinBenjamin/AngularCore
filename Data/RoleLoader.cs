using CommonDomainObjects;
using NHibernate;
using Roles;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Data
{
    public class RoleLoader: IEtl
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private static readonly string _fileName = "Role.csv";

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
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await (
                    from record in await _csvExtractor.ExtractAsync(_fileName)
                    select new Role(
                        new Guid(record[0]),
                        record[1])).ForEachAsync(role => session.SaveAsync(role));
                await transaction.CommitAsync();
            }
        }
    }
}

using NHibernate;
using Roles;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public class RoleLoader: IEtl<IEnumerable<Role>>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        public RoleLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }

        async Task<IEnumerable<Role>> IEtl<IEnumerable<Role>>.ExecuteAsync()
        {
            var roles = await _csvExtractor.ExtractAsync(
                "Role.csv",
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

            return roles;
        }
    }
}

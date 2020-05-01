using CommonDomainObjects;
using NHibernate;
using NHibernate.Criterion;
using System.Data;
using System.Threading.Tasks;

namespace Service
{
    public class DomainObjectService<TId, TDomainObject>: IDomainObjectService<TId, TDomainObject>
        where TDomainObject : DomainObject<TId>
    {
        protected readonly ISession _session;

        public DomainObjectService(
            ISession session
            )
        {
            _session = session;
        }

        async Task<TDomainObject> IDomainObjectService<TId, TDomainObject>.GetAsync(
            TId id
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
                return await CreateCriteria(
                    _session,
                    id).UniqueResultAsync<TDomainObject>();
        }

        protected virtual ICriteria CreateCriteria(
            ISession session
            )
        {
            return session
                .CreateCriteria<TDomainObject>();
        }

        protected virtual ICriteria CreateCriteria(
            ISession session,
            TId      id
            )
        {
            return CreateCriteria(session)
                .Add(Expression.Eq("Id", id));
        }
    }
}

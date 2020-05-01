using CommonDomainObjects;
using NHibernate;
using NHibernate.Criterion;
using System;
using System.Data;
using System.Threading.Tasks;

namespace Service
{
    public class TaxonomyService<TTerm>: IDomainObjectService<Guid, Taxonomy<TTerm>>
    {
        protected readonly ISession _session;

        public TaxonomyService(
            ISession session
            )
        {
            _session = session;
        }

        async Task<Taxonomy<TTerm>> IDomainObjectService<Guid, Taxonomy<TTerm>>.GetAsync(
            Guid id
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
            {
                _session
                    .CreateCriteria<TaxonomyTerm<TTerm>>()
                    .Fetch("Narrower")
                    .Fetch("Term")
                    .CreateCriteria("Taxonomy")
                        .Add(Expression.Eq("Id", id))
                    .Future<TaxonomyTerm<TTerm>>();
                return await _session
                    .CreateCriteria<Taxonomy<TTerm>>()
                    .Add(Expression.Eq("Id", id))
                    .Fetch("Terms")
                    .FutureValue<Taxonomy<TTerm>>().GetValueAsync();
            }
        }
    }
}

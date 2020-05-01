using CommonDomainObjects;
using NHibernate;
using NHibernate.Criterion;
using System.Collections.Generic;
using System.Data;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Service
{
    public class NamedService<TId, TNamed, TNamedFilters>:
        DomainObjectService<TId, TNamed>,
        INamedService<TId, TNamed, TNamedFilters>
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters
    {
        private static readonly Regex _escaped = new Regex(
            "[%_[]",
            RegexOptions.Compiled);

        public NamedService(
            ISession session
            ) : base(session)
        {
        }

        async Task<IEnumerable<TNamed>> INamedService<TId, TNamed, TNamedFilters>.FindAsync(
            TNamedFilters filters
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
                return await CreateCriteria(
                    _session,
                    filters).ListAsync<TNamed>();
        }

        protected virtual ICriteria CreateCriteria(
            ISession      session,
            TNamedFilters filters
            )
        {
            var criteria = CreateCriteria(session);
            if(!string.IsNullOrEmpty(filters.NameFragment))
                criteria.Add(Expression.Like(
                    "Name",
                    _escaped.Replace(
                        filters.NameFragment,
                        "\\$&"),
                    MatchMode.Anywhere,
                    '\\'));

            if(filters.MaxResults.HasValue)
                criteria.SetMaxResults(filters.MaxResults.Value);

            AddOrder(criteria);

            return criteria;
        }

        protected virtual void AddOrder(
            ICriteria criteria
            )
        {
            criteria.AddOrder(Order.Asc("Name"));
        }
    }
}

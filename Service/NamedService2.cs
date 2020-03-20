using AutoMapper;
using CommonDomainObjects;
using NHibernate;
using NHibernate.Criterion;
using System.Collections.Generic;
using System.Data;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Service
{
    public class NamedService2<TId, TNamed, TNamedModel, TNamedFilters>: INamedService2<TId, TNamedModel, TNamedFilters>
        where TNamed: Named<TId>
        where TNamedModel: Model.Named<TId>
        where TNamedFilters : NamedFilters
    {
        private static readonly Regex _escaped = new Regex(
            "[%_[]",
            RegexOptions.Compiled);

        private readonly ISession _session;
        private readonly IMapper  _mapper;

        public NamedService2(
            ISession session,
            IMapper  mapper
            )
        {
            _session = session;
            _mapper  = mapper;
        }

        async Task<TNamedModel> INamedService2<TId, TNamedModel, TNamedFilters>.GetAsync(
            TId id
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
                return await CreateCriteria(
                    _session,
                    id).UniqueResultAsync<TNamed>().ContinueWith(task => _mapper.Map<TNamedModel>(task.Result));
        }

        async Task<IEnumerable<TNamedModel>> INamedService2<TId, TNamedModel, TNamedFilters>.FindAsync(
            TNamedFilters filters
            )
        {
            using(_session.BeginTransaction(IsolationLevel.ReadCommitted))
                return await CreateCriteria(
                    _session,
                    filters).ListAsync<TNamed>().ContinueWith(task => _mapper.Map<IEnumerable<TNamedModel>>(task.Result));
        }

        protected virtual ICriteria CreateCriteria(
            ISession session
            )
        {
            var criteria = session
                .CreateCriteria<TNamed>();
            AddOrder(criteria);
            return criteria;
        }

        protected virtual ICriteria CreateCriteria(
            ISession session,
            TId      id
            )
        {
            return CreateCriteria(session)
                .Add(Expression.Eq("Id", id));
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

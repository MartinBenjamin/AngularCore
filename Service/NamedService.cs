﻿using CommonDomainObjects;
using NHibernate;
using NHibernate.Criterion;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Service
{
    public class NamedService<TId, TNamed, TNamedFilters>: INamedService<TId, TNamed, TNamedFilters>
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters
    {
        private static readonly Regex _escaped = new Regex(
            "[%_[]",
            RegexOptions.Compiled);

        private readonly ISession _session;

        public NamedService(
            ISession session
            )
        {
            _session = session;
        }

        TNamed INamedService<TId, TNamed, TNamedFilters>.Get(
            TId id
            )
        {
            return CreateCriteria(
                _session,
                id).UniqueResult<TNamed>();
        }

        IEnumerable<TNamed> INamedService<TId, TNamed, TNamedFilters>.Find(
            TNamedFilters filters
            )
        {
            return CreateCriteria(
                _session,
                filters).List<TNamed>();
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

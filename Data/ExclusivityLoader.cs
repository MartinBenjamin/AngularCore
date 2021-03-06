﻿using CommonDomainObjects;
using Deals;
using NHibernate;
using System;

namespace Data
{
    public class ExclusivityLoader: ClassificationSchemeLoader
    {
        public ExclusivityLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            ) : base(
                csvExtractor,
                sessionFactory,
                new Guid("f7c20b62-ffe8-4c20-86b4-e5c68ba2469d"),
                "Exclusivity.csv")
        {
        }

        protected override Classifier NewClassifier(
            Guid   id,
            string name
            ) => new ExclusivityClassifier(
                id,
                name);
    }
}

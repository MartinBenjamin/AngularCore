﻿using CommonDomainObjects;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    using Naics;

    public class NaicsLoader: IEtl<ClassificationScheme>
    {
        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;

        private static readonly Guid _classificationSchemeId = new Guid("3833e9f7-ebab-4205-bfce-8464d0706f11");

        public NaicsLoader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
        }


        async Task<ClassificationScheme> IEtl<ClassificationScheme>.ExecuteAsync()
        {
            var classifiers = await _csvExtractor.ExtractAsync(
                "NAICS2017.csv",
                record =>
                {
                    var components = record[1].Split('-');
                    var start = int.Parse(components[0]);
                    var end   = components.Length == 1 ? start : int.Parse(components[1]);
                    return new NaicsClassifier(
                        Guid.NewGuid(),
                        record[2],
                        new Range<int>(start, end));
                });

            var parents = new NaicsClassifier[7];
            var super = new Dictionary<Classifier, IList<Classifier>>();
            var empty = new List<Classifier>();

            // Take advantage of the fact that a parent appears directly before its children in the CSV file.
            foreach(var classifier in classifiers)
            {
                var length = classifier.CodeRange.Start.ToString().Length;
                var parent = parents[length - 1];
                super[classifier] = parent == null ? empty : new List<Classifier> { parent };
                parents[length] = classifier;
            }

            var classificationScheme = new ClassificationScheme(
                _classificationSchemeId,
                super);
            using(var session = _sessionFactory.OpenSession())
            using(var transaction = session.BeginTransaction())
            {
                await session.SaveAsync(classificationScheme);
                await classificationScheme.VisitAsync(
                    async classificationSchemeClassifier =>
                    {
                        await session.SaveAsync(classificationSchemeClassifier.Classifier);
                        await session.SaveAsync(classificationSchemeClassifier);
                    },
                    null);
                await transaction.CommitAsync();
            }

            return classificationScheme;
        }
    }
}
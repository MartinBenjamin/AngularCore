﻿using CommonDomainObjects;
using Identifiers;
using Iso3166._1;
using Locations;
using NHibernate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using UnsdM49;

namespace Data
{
    public class Unsdm49Loader: IEtl
    {
        private static readonly Func<Guid, string, GeographicRegion>[] _levels = new Func<Guid, string, GeographicRegion>[]
            {
                (Guid id, string name) => new Global            (id, name),
                (Guid id, string name) => new Region            (id, name),
                (Guid id, string name) => new SubRegion         (id, name),
                (Guid id, string name) => new IntermediateRegion(id, name)
            };

        private readonly ICsvExtractor   _csvExtractor;
        private readonly ISessionFactory _sessionFactory;
        private readonly IGuidGenerator  _guidGenerator;

        private static readonly Guid   _identificationSchemeId = new Guid("b7b5b6cd-be4c-4cf7-a715-fe23bb12d6f7");
        private static readonly string _fileName = "UNSDM49.csv";

        public Unsdm49Loader(
            ICsvExtractor   csvExtractor,
            ISessionFactory sessionFactory,
            IGuidGenerator  guidGenerator
            )
        {
            _csvExtractor   = csvExtractor;
            _sessionFactory = sessionFactory;
            _guidGenerator  = guidGenerator;
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
                // Populate session.
                await session
                    .CreateCriteria<GeographicRegion>()
                    .Fetch("Subregions")
                    .ListAsync<GeographicRegion>();

                var geographicRegions = await session
                    .CreateCriteria<GeographicRegion>()
                    .ListAsync<GeographicRegion>();

                var countries = geographicRegions.OfType<Country>().ToDictionary(
                    country => country.Alpha3Code,
                    country => country);

                var records = await _csvExtractor.ExtractAsync(_fileName);
                var m49Regions = new Dictionary<string, GeographicRegion>();
                var m49RegionSubregions = new HashSet<GeographicRegionSubregion>();
                foreach(var record in records)
                    if(countries.TryGetValue(
                        record[10],
                        out var country))
                    {
                        m49Regions[record[9]] = country;
                        GeographicSubregion subregion = country;
                        var level = _levels.Length - 1;
                        while(level >= 0)
                        {
                            var code = record[level * 2];
                            if(code != string.Empty)
                            {
                                m49Regions.TryGetValue(
                                    code,
                                    out var region);

                                if(region == null)
                                {
                                    region = _levels[level](
                                        _guidGenerator.Generate(CountryLoader.NamespaceId, code),
                                        record[level * 2 + 1]);
                                    await session.SaveAsync(region);

                                    m49Regions[code] = region;
                                }

                                var regionSubregion = new GeographicRegionSubregion(
                                    region,
                                    subregion);

                                if(m49RegionSubregions.Contains(regionSubregion))
                                    break;

                                m49RegionSubregions.Add(regionSubregion);
                                subregion = region as GeographicSubregion;
                            }

                            level -= 1;
                        }
                    }

                await m49RegionSubregions.ForEachAsync(regionSubregion => session.SaveAsync(regionSubregion));

                var identificationScheme = new IdentificationScheme(
                    _identificationSchemeId,
                    "UN M49");
                await session.SaveAsync(identificationScheme);
                await m49Regions.ForEachAsync(pair => session.SaveAsync(
                    new GeographicRegionIdentifier(
                        identificationScheme,
                        pair.Key,
                        pair.Value)));

                var world = m49Regions["001"];
                var child = new Dictionary<GeographicRegion, IList<GeographicRegion>>();
                world.Visit(region =>
                    child[region] = region.Subregions
                        .Cast<GeographicRegion>()
                        .OrderBy(subregion => subregion.Name)
                        .ToList());
                var hierarchy = new GeographicRegionHierarchy(
                    new Guid("80bd57c5-7f3a-48d6-ba89-ad9ddaf12ebb"),
                    child);
                await session.SaveAsync(hierarchy);
                await hierarchy.VisitAsync(member => session.SaveAsync(member));

                await transaction.CommitAsync();
            }
        }
    }
}

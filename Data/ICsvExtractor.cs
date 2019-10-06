using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Data
{
    public interface ICsvExtractor
    {
        IList<T> Extract<T>(
           string                 fileName,
           Func<IList<string>, T> transform);
    }

    public static class ICsvExtractorExtensions
    {
        public static IList<Country> ExtractIso3166_1(
            this ICsvExtractor extractor
            )
        {
            return extractor.Extract(
                "ISO3166-1.csv",
                record => new Country(
                    record[2],
                    record[3],
                    null,
                    int.Parse(record[4]),
                    record[0]));
        }

        public static GeographicalAreaHierarchy ExtractIso3166(
            this ICsvExtractor extractor
            )
        {
            var emptyGeographicalAreaArray = new GeographicalArea[] { };
            IDictionary<string, GeographicalArea> areaMap = extractor.ExtractIso3166_1()
                .Cast<GeographicalArea>()
                .ToDictionary(country => country.Id);

            var areaHierarchy = areaMap
                .Values
                .ToDictionary<GeographicalArea, GeographicalArea, IList<GeographicalArea>>(
                    area => area,
                    area => emptyGeographicalAreaArray);

            var recordMap = new[]
            {
                "ISO3166-2(GB).csv",
                "ISO3166-2(US).csv"
            }.SelectMany(
                fileName => extractor.Extract(
                    fileName,
                    record => record.ToList()))
            .ToDictionary(record => record[1]);

            var emptyRecordArray = new IList<string>[] { };
            var recordHierarchy = recordMap
                .Values
                .ToDictionary<IList<string>, IList<string>, IList<IList<string>>>(
                    record => record,
                    record =>
                    {
                        var parentCode = record[6];
                        return string.IsNullOrEmpty(parentCode) ? emptyRecordArray : new IList<string>[] { recordMap[parentCode] };
                    });

            recordHierarchy
                .TopologicalSort()
                .ToList()
                .ForEach(
                    record =>
                    {
                        var code        = record[1];
                        var parentCode  = record[6];
                        var countryCode = code.Substring(0, 2);

                        Subdivision parent = null;
                        if(!string.IsNullOrEmpty(parentCode))
                            parent = (Subdivision)areaMap[parentCode];

                        var country = (Country)areaMap[countryCode];

                        var subdivision = new Subdivision(
                            code,
                            record[2],
                            country,
                            parent,
                            record[0]);

                        areaMap[subdivision.Id] = subdivision;
                        areaHierarchy[subdivision] = new[] { subdivision.Area };
                    });

            return new GeographicalAreaHierarchy(areaHierarchy);
        }

        public static IList<Currency> ExtractIso4217(
            this ICsvExtractor extractor
            )
        {
            return extractor.Extract(
                "ISO4217.csv",
                record => !string.IsNullOrEmpty(record[2]) ?
                    new Currency(
                        record[2],
                        int.Parse(record[3]),
                        record[1],
                        record[4] == "N.A." ? (int?)null : int.Parse(record[4])) : null)
                .Distinct()
                .ToList();
        }
    }
}

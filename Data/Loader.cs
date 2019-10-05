using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using Peg;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Data
{
    public static class Loader
    {
        public static Stream Load(
            string fileName
            )
        {
            return Assembly.GetExecutingAssembly().GetManifestResourceStream(typeof(Loader).Namespace + '.' + fileName);
        }

        public static string ReadAllText(
            string fileName
            )
        {
            using(var stream = Load(fileName))
            using(var reader = new StreamReader(stream))
                return reader.ReadToEnd();
        }

        private static IList<T> Load<T>(
            string                 fileName,
            Func<IList<string>, T> constructor,
            bool                   heading = true
            )
        {
            var list = new List<T>();
            var record = new List<string>();
            var parser = new Rfc4180Parser(
                field => record.Add(field),
                () =>
                {
                    if(heading)
                        heading = false;

                    else
                    {
                        var t = constructor(record);

                        if(t != null)
                            list.Add(t);
                    }

                    record.Clear();
                });

            parser.Parse(ReadAllText(fileName));

            return list;
        }

        public static IList<Country> LoadIso3166_1()
        {
            return Load(
                "ISO3166-1.csv",
                record => new Country(
                    record[2],
                    record[3],
                    null,
                    int.Parse(record[4]),
                    record[0]));
        }

        public static GeographicalAreaHierarchy LoadIso3166()
        {
            var emptyGeographicalAreaArray = new GeographicalArea[] { };
            IDictionary<string, GeographicalArea> areaMap = LoadIso3166_1()
                .Cast<GeographicalArea>()
                .ToDictionary(country => country.Id);

            var areaHierarchy = areaMap
                .Values
                .ToDictionary<GeographicalArea, GeographicalArea, IList<GeographicalArea>>(
                    area => area,
                    area => emptyGeographicalAreaArray);

            var recordMap = Load(
                "ISO3166-2(US).csv",
                record => record.ToList()).ToDictionary(record => record[1]);

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
                        areaHierarchy[subdivision] = new[] { (GeographicalArea)parent ?? country };
                    });

            return new GeographicalAreaHierarchy(areaHierarchy);
        }

        public static IList<Currency> LoadIso4217()
        {
            return Load(
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

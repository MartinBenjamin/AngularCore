using CommonDomainObjects;
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

        public static IList<Country> LoadCountries()
        {
            return Load<Country>(
                "ISO3166-1.csv",
                record => new Country(
                    record[2],
                    record[3],
                    null,
                    int.Parse(record[4]),
                    record[0]));
        }

        //public static GeographicalAreaHierarchy LoadIso3166()
        //{
        //    //var countries = 
        //    IDictionary<string, GeographicalArea> areas = LoadCountries()
        //        .Cast<GeographicalArea>()
        //        .ToDictionary(country => country.Id);

        //    var hierarchy = areas.Keys.ToDictionary(
        //        area => area,
        //        area => new GeographicalArea[] { });

        //    var subdivisions = Load<Subdivision>(
        //        "ISO3166-2(US).csv",
        //        record =>
        //        {
        //            var code        = record[1];
        //            var parentCode  = record[6];
        //            var countryCode = record[1].Substring(0, 2);
        //            hierarchy[code] = string.IsNullOrEmpty(parentCode) ? countryCode : parentCode;

        //            return new Subdivision(
        //                code,
        //                record[2],
        //                countries[countryCode],
        //                record[0]);
        //        });

        //    var areas = countries
        //        .Values
        //        .Cast<GeographicalArea>()
        //        .Concat(subdivisions)
        //        .ToDictionary(area => area.Id);

        //    return new GeographicalAreaHierarchy(
        //        areas.Keys.ToDictionary<string, GeographicalArea, IList<GeographicalArea>>(
        //            code => areas[code],
        //            code => new[] { areas[hierarchy[code]] }));
        //}

        public static IList<Currency> LoadCurrencies()
        {
            return Load<Currency>(
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

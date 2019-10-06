using Peg;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Data
{
    public class CsvExtractor: ICsvExtractor
    {
        public IList<IList<string>> Extract(
            string fileName
            )
        {
            return Extract(
                fileName,
                record => (IList<string>)record.ToList());
        }

        public IList<T> Extract<T>(
            string                 fileName,
            Func<IList<string>, T> transform
            )
        {
            var heading = true;
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
                        var t = transform(record);

                        if(t != null)
                            list.Add(t);
                    }

                    record.Clear();
                });

            parser.Parse(ReadAllText(fileName));

            return list;
        }

        public static string ReadAllText(
            string fileName
            )
        {
            using(var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName(fileName)))
            using(var reader = new StreamReader(stream))
                return reader.ReadToEnd();
        }

        public static string ResourceName(
            string fileName
            )
        {
            return typeof(CsvExtractor).Namespace + '.' + fileName;
        }
    }
}

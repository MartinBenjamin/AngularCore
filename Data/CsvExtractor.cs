using Peg;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace Data
{
    public class CsvExtractor: ICsvExtractor
    {
        public async Task<IList<IList<string>>> ExtractAsync(
            string fileName
            )
        {
            return await ExtractAsync(
                fileName,
                record => (IList<string>)record.ToList());
        }

        public async Task<IList<T>> ExtractAsync<T>(
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

            parser.Parse(await ReadAllTextAsync(fileName));

            return list;
        }

        public static async Task<string> ReadAllTextAsync(
            string fileName
            )
        {
            using(var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(ResourceName(fileName)))
            using(var reader = new StreamReader(stream))
                return await reader.ReadToEndAsync();
        }

        public static string ResourceName(
            string fileName
            )
        {
            return typeof(CsvExtractor).Namespace + '.' + fileName;
        }
    }
}

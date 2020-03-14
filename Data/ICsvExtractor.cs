using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public interface ICsvExtractor
    {
        Task<IList<IList<string>>> ExtractAsync(string fileName);

        Task<IList<T>> ExtractAsync<T>(
           string                 fileName,
           Func<IList<string>, T> transform);
    }
}

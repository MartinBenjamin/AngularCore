using System;
using System.Collections.Generic;

namespace Data
{
    public interface ICsvExtractor
    {
        IList<IList<string>> Extract(string fileName);

        IList<T> Extract<T>(
           string                 fileName,
           Func<IList<string>, T> transform);
    }
}

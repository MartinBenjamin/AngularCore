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
}

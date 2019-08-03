using CommonDomainObjects;
using System.Collections.Generic;

namespace Service
{
    public class NamedFilters
    {
        public string NameFragment { get; set; }
        public int?   MaxResults   { get; set; }
    }

    public interface INamedService<TId, TNamed> where TNamed: Named<TId>
    {
        TNamed Get(TId id);

        IEnumerable<TNamed> Find(NamedFilters filters);
    }
}

using CommonDomainObjects;
using System.Collections.Generic;

namespace Service
{
    public class NamedFilters
    {
        public string NameFragment { get; set; }
        public int?   MaxResults   { get; set; }
    }

    public interface INamedService<TId, out TNamed, TFilters> 
        where TNamed: Named<TId>
        where TFilters: NamedFilters
    {
        TNamed Get(TId id);

        IEnumerable<TNamed> Find(TFilters filters);
    }
}

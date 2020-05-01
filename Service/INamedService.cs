using CommonDomainObjects;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service
{
    public class NamedFilters
    {
        public string NameFragment { get; set; }
        public int?   MaxResults   { get; set; }
    }

    public interface INamedService<TId, TNamed, TNamedFilters>:
        IDomainObjectService<TId, TNamed>
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters
    {
        Task<IEnumerable<TNamed>> FindAsync(TNamedFilters filters);
    }
}

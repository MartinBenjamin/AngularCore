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

    public interface INamedService<TId, TNamed, TNamedFilters> 
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters
    {
        Task<TNamed> GetAsync(TId id);

        Task<IEnumerable<TNamed>> FindAsync(TNamedFilters filters);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;

namespace Service
{
    public interface INamedService2<TId, TNamedModel, TNamedFilters>
        where TNamedModel : Model.Named<TId>
        where TNamedFilters : NamedFilters
    {
        Task<TNamedModel> GetAsync(TId id);

        Task<IEnumerable<TNamedModel>> FindAsync(TNamedFilters filters);
    }
}

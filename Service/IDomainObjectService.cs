using CommonDomainObjects;
using System.Threading.Tasks;

namespace Service
{
    public interface IDomainObjectService<TId, TDomainObject>
        where TDomainObject : DomainObject<TId>
    {
        Task<TDomainObject> GetAsync(TId id);
    }
}

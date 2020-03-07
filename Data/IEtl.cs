using System.Threading.Tasks;

namespace Data
{
    public interface IEtl<T>
    {
        Task<T> ExecuteAsync();
    }
}

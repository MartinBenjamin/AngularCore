using System.Threading.Tasks;

namespace Data
{
    public interface ILoader<T>
    {
        Task LoadAsync(T t);
    }
}

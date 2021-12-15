using System.Threading.Tasks;

namespace Data
{
    public interface IEtl<T>
    {
        Task<T> ExecuteAsync();
    }

    public interface IEtl
    {
        string FileName { get; }

        Task ExecuteAsync();
    }
}

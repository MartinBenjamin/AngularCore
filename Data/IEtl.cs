using System.Threading.Tasks;

namespace Data
{
    public interface IEtl
    {
        string FileName { get; }

        Task ExecuteAsync();
    }
}

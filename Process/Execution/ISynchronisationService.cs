using System.Runtime.CompilerServices;

namespace Process.Execution
{
    public interface ISynchronisationService
    {
        Synchronisation Resolve(ITuple channel);
    }
}

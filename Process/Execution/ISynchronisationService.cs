using Process.Definition;

namespace Process.Execution
{
    public interface ISynchronisationService
    {
        Synchronisation Resolve(Channel channel);
    }
}

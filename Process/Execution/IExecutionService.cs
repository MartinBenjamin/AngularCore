using Process.Definition;

namespace Process.Execution
{

    public delegate void Trace(
        Channel channel,
        object  value);

    public interface IExecutionService
    {
        public Trace Trace { get; set; }

        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}

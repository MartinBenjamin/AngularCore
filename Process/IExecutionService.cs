namespace Process
{
    public interface IExecutionService
    {
        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
    }
}

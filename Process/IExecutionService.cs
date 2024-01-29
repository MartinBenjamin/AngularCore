namespace Process
{
    public interface IExecutionService
    {
        ISynchronisationService SynchronisationService { get; }

        void Execute(IExecutable executable);
        void Save(IExecutable executable);
        void Delete(IExecutable executable);
    }
}

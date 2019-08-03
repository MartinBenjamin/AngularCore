namespace CommonDomainObjects.Process
{
    public interface IExecutionService
    {
        void Save(IExecutable executable);
        void Delete(IExecutable executable);
        void Execute(IExecutable executable);
    }
}

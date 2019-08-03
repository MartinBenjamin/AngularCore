namespace CommonDomainObjects.Process
{
    public interface IExecutable
    {
        void Execute(IExecutionService executionService);
    }
}

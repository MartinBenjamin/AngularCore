namespace Process.Execution
{
    public interface IExecutable
    {
        void Execute(IExecutionService executionService);
    }
}

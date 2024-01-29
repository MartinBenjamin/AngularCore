namespace Process
{
    public interface IExecutionService
    {
        void Save(IExecutable executable);
        void Delete(IExecutable executable);
        void Execute(IExecutable executable);

        void Register(IO     io    );
        void Register(Input  input );
        void Register(Output output);
        void Deregister(IO     io    );
        void Deregister(Input  input );
        void Deregister(Output output);

    }
}

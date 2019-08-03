namespace CommonDomainObjects.Process
{
    public enum Status
    {
        NotExecuted,
        Executing,
        AwaitChoice,
        AwaitIO,
        Executed,
        NotChosen
    }
}

namespace CommonDomainObjects.Process.Definition
{
    public interface IReplicated<TValue>
    {
        CommonDomainObjects.Process.Process Replicate(
            CommonDomainObjects.Process.Process parent,
            TValue                              value);
    }
}

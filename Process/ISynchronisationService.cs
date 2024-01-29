namespace Process
{
    public interface ISynchronisationService
    {
        Synchronisation Resolve(Channel channel);
    }
}

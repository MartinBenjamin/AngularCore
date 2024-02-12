namespace Process
{
    public interface IIdService<TId>
    {
        TId NewId();
    }
}

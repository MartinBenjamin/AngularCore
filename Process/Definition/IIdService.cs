namespace Process.Definition
{
    public interface IIdService<TId>
    {
        TId NewId();
    }
}

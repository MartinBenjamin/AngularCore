namespace Process.Definition
{
    public interface IReplicated<TValue>
    {
        global::Process.Process Replicate(
            global::Process.Process parent,
            TValue                  value);
    }
}

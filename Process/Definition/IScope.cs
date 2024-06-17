namespace Process.Definition
{
    public interface IScope
    {
        object this[string variable] { get; set; }
    }
}

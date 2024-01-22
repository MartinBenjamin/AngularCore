namespace Process.Expression
{
    public interface IScope
    {
        object this[string variable] { get; set; }
    }
}

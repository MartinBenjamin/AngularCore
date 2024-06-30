namespace Process.Definition
{
    public interface IProcess
    {
        public void Accept(IVisitor visitor);

        public TResult Select<TResult>(ISelector<TResult> selector);
    }
}

namespace Process.Definition
{
    public class InfinitelyReplicated: GuardedProcess
    {
        public InfinitelyReplicated(
            IIO         guard,
            ISubprocess guarded
            )
            : base(
                guard,
                guarded)
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override TResult Select<TResult>(
            ISelector<TResult> selector
            ) => selector.Select(this);
    }
}

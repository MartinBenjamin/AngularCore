using System.Text;

namespace Process.Definition
{
    public abstract class Process: IProcess
    {
        protected Process()
            : base()
        {
        }

        public abstract void Accept(IVisitor visitor);

        public abstract TResult Select<TResult>(ISelector<TResult> selector);

        public override string ToString()
        {
            var builder = new StringBuilder();
            Accept(new ProcessWriter(builder));
            return builder.ToString();
        }
    }
}

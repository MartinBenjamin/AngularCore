using System;
using System.Text;

namespace CommonDomainObjects.Process.Definition
{
    public abstract class Process: DomainObject<Guid>
    {
        protected Process()
            : base()
        {
        }

        protected Process(
            Guid id
            )
            : base(id)
        {
        }

        public virtual CommonDomainObjects.Process.Process New(
            CommonDomainObjects.Process.Process parent
            )
        {
            throw new NotImplementedException();
        }

        public override string ToString()
        {
            var builder = new StringBuilder();
            ToString(builder);
            return builder.ToString();
        }

        public virtual void ToString(
            StringBuilder builder
            )
        {
        }
    }
}

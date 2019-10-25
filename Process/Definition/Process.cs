using CommonDomainObjects;
using System;
using System.Text;

namespace Process.Definition
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

        public virtual global::Process.Process New(
            global::Process.Process parent
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

﻿using CommonDomainObjects;
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

﻿using Process.Expression;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Process.Definition
{
    public abstract class ParallelBase: Composite
    {
        protected ParallelBase()
            : base()
        {
        }

        protected ParallelBase(
            Guid id
            )
            : base(id)
        {
        }

        public override global::Process.Process New(
            Guid                        id,
            global::Process.Process     parent,
            IDictionary<string, object> variables = null
            ) => new global::Process.Parallel(
                id,
                this,
                parent,
                variables);
    }

    public class Parallel: ParallelBase
    {
        public IList<Process> Children { get; set; }

        public Parallel(
            params Process[] children
            )
            : base()
        {
            Children = children;
        }

        public Parallel(
            Guid id
            )
            : base(id)
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override IList<global::Process.Process> NewChildren(
            IIdService<Guid>        idService,
            global::Process.Process parent
            ) => Children.Select(
                child => child.New(
                    idService.NewId(),
                    parent)).ToList();
    }

    public class ParallelForEach: ParallelBase
    {
        public IExpression<IEnumerable<IDictionary<string, object>>> Variables  { get; set; }
        public Process                                               Replicated { get; set; }

        public ParallelForEach()
            : base()
        {
        }

        public ParallelForEach(
            Guid id
            )
            : base(id)
        {
        }

        public override void Accept(
            IVisitor visitor
            ) => visitor.Visit(this);

        public override IList<global::Process.Process> NewChildren(
            IIdService<Guid>        idService,
            global::Process.Process parent
            ) => Variables.Evaluate(parent).Select(variables => Replicated.New(
                idService.NewId(),  
                parent,
                variables)).ToList();
    }
}

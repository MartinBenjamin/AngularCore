﻿using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Process
{
    public class Choice: Alternative
    {
        public virtual IList<Alternative> Alternatives { get; protected set; }

        internal protected Choice(
            Guid                        id,
            Definition.ChoiceBase       definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                id,
                definition,
                parent,
                variables)
        {
        }

        protected override void Execute(
            IExecutionService executionService
            )
        {
            if(Status == Status.NotExecuted)
            {
                var alternatives = Definition.As<Definition.ChoiceBase>().NewAlternatives(
                    executionService,
                    this).ToList();
                Alternatives = alternatives;
                alternatives.ForEach(alternative => ((IExecutable)alternative).Execute(executionService));

                ChangeStatus(
                    executionService,
                    alternatives.Any(alternative => alternative.Status == Status.Waiting) ? Status.Waiting : Status.Skipped);
            }

            if(Status == Status.Executing &&
                Alternatives.Any(alternative => alternative.Status == Status.Executed))
                    ChangeStatus(
                        executionService,
                        Status.Executed);
        }

        public override bool Choose(
            IExecutionService executionService,
            Alternative       alternative
            )
        {
            var chosen = Alternatives
                .Select(a => a.Choose(
                    executionService,
                    alternative))
                .Aggregate((lhs, rhs) => lhs || rhs);

            ChangeStatus(
                executionService,
                chosen ? Status.Executing : Status.Skipped);

            return chosen;
        }
    }
}

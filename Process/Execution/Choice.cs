using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Process.Execution
{
    public abstract class ChoiceBase: Alternative
    {
        public virtual IList<Alternative> Alternatives { get; protected set; }

        internal protected ChoiceBase(
            Definition.ChoiceBase       definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
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
                Alternatives = NewAlternatives(executionService);
                Alternatives.ForEach(alternative => ((IExecutable)alternative).Execute(executionService));

                ChangeStatus(
                    executionService,
                    Alternatives.Any(alternative => alternative.Status == Status.Waiting) ? Status.Waiting : Status.Skipped);
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

        protected abstract IList<Alternative> NewAlternatives(IExecutionService executionService);
    }

    public class Choice: ChoiceBase
    {
        private readonly Definition.Choice _definition;

        internal protected Choice(
            Definition.Choice           definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
            _definition = definition;
        }

        protected override IList<Alternative> NewAlternatives(
            IExecutionService executionService
            ) => _definition.Alternatives.Select(alternative => alternative.Select(Constructor.Instance)(
                this,
                null)).Cast<Alternative>().ToList();
    }

    public class ChoiceForEach: ChoiceBase
    {
        private readonly Definition.ChoiceForEach _definition;

        public ChoiceForEach(
            Definition.ChoiceForEach    definition,
            Process                     parent,
            IDictionary<string, object> variables
            )
            : base(
                definition,
                parent,
                variables)
        {
            _definition = definition;
        }

        protected override IList<Alternative> NewAlternatives(
            IExecutionService executionService
            ) => _definition.Variables(this).Select(variables => _definition.Replicated.Select(Constructor.Instance)(
                this,
                variables)).Cast<Alternative>().ToList();
    }
}

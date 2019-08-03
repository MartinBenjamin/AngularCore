using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects.Process
{
    public class Choice: Alternative
    {
        public virtual IList<Alternative> Alternatives { get; protected set; }

        protected Choice()
            : base()
        {
        }

        internal protected Choice(
            Definition.ChoiceBase definition,
            Process               parent
            )
            : base(
                definition,
                parent)
        {
        }

        protected override void Execute(
            IExecutionService executionService
            )
        {
            if(Status == Status.NotExecuted)
            {
                var alternatives = Definition.As<Definition.ChoiceBase>().NewAlternatives(this).ToList();
                Alternatives = alternatives;
                alternatives.ForEach(executionService.Save);
                alternatives.ForEach(alternative => ((IExecutable)alternative).Execute(executionService));

                ChangeStatus(
                    executionService,
                    alternatives.Any(alternative => alternative.Status == Status.AwaitChoice) ? Status.AwaitChoice : Status.NotChosen);
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
                chosen ? Status.Executing : Status.NotChosen);

            return chosen;
        }
    }
}

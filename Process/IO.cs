using CommonDomainObjects;

namespace Process
{
    public class IO: Process
    {
        public virtual Channel Channel { get; protected set; }

        protected IO()
            : base()
        {
        }

        public IO(
            Definition.Process definition,
            Process            parent
            )
            : base(
                definition,
                parent)
        {
            var channelDefinition = ((Definition.IO)definition).Channel;
            Channel = channelDefinition.New(this);
        }

        protected override void Execute(
            IExecutionService executionService
            )
        {
            if(Status == Status.NotExecuted)
                ChangeStatus(
                    executionService,
                    Status.AwaitIO);
        }

        protected override void ChangeStatus(
            IExecutionService executionService,
            Status            status
            )
        {
            if(status != Status)
                if(status == Status.AwaitIO)
                    Register(executionService);

                else if(Status == Status.AwaitIO)
                    Deregister(executionService);

            if(status == Status.Executed)
            {
                var guardedProcess = Parent.As<GuardedProcess>();
                if(guardedProcess != null &&
                   guardedProcess.Guard == this)
                {
                    var choice = guardedProcess.Parent.As<Choice>();
                    while(choice.Parent != null && choice.Parent.Is<Choice>())
                        choice = choice.Parent.As<Choice>();

                    choice.Choose(
                        executionService,
                        guardedProcess);
                }
            }

            base.ChangeStatus(
                executionService,
                status);
        }

        internal void NotChosen(
            IExecutionService executionService
            )
        {
            base.ChangeStatus(
                executionService,
                Status.NotChosen);
        }

        public virtual void ExecuteIO(
            IExecutionService executionService
            )
        {
            if(Status != Status.AwaitIO)
                throw new InvalidStateException();

            ChangeStatus(
                executionService,
                Status.Executed);
        }

        protected virtual void Register(
            IExecutionService executionService
            )
        {
        }

        protected virtual void Deregister(
            IExecutionService executionService
            )
        {
        }
    }
}

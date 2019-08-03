namespace CommonDomainObjects.Process
{
    public abstract class Alternative: Process
    {
        protected Alternative()
            : base()
        {
        }

        protected Alternative(
            Definition.Alternative definition,
            Process                parent
            )
            : base(
                definition,
                parent)
        {
        }

        public abstract bool Choose(
            IExecutionService executionService,
            Alternative       alternative);
    }
}

namespace CommonDomainObjects
{
    public abstract class Named<TId>: DomainObject<TId>
    {
        public virtual string Name { get; protected set; }

        protected Named() : base()
        {
        }

        protected Named(
            TId    id,
            string name
            ) : base(id)
        {
            Name = name;
        }

        public override string ToString()
            => Name;
    }
}

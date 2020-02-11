using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CommonDomainObjects
{
    public class VersionedObject<TId, TVersioned, TVersion, TObject>: DomainObject<TId>
        where TVersioned: VersionedObject<TId, TVersioned, TVersion, TObject>
        where TVersion: VersionedObject<TId, TVersioned, TVersion, TObject>.ObjectVersion
    {
        private IList<TVersion> _versions;

        public class ObjectVersion: DomainObject<TId>
        {
            public virtual     TVersioned Versioned { get; protected set; }
            public virtual     int        Number    { get; protected set; }
            new public virtual TObject    Object    { get; protected set; }

            protected ObjectVersion() : base()
            {
            }

            public ObjectVersion(
                TId        id,
                TVersioned versioned,
                TObject    @object
                ) : base(id)
            {
                Versioned = versioned;
                Versioned._versions.Add((TVersion)this);
                Number    = Versioned.NextNumber();
                Object    = @object;
            }
        }

        public virtual int Number { get; protected set; }

        public virtual IReadOnlyList<TVersion> Versions
        {
            get
            {
                return new ReadOnlyCollection<TVersion>(_versions);
            }
        }

        protected VersionedObject() : base()
        {
        }

        public VersionedObject(
            TId id
            ) : base(id)
        {
            _versions = new List<TVersion>();
        }

        protected virtual int NextNumber()
        {
            return ++Number;
        }
    }
}

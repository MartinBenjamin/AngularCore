using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CommonDomainObjects
{
    public class VersionedObject<TId, TVersioned, TVersion, TObject>: DomainObject<TId>
        where TVersioned: VersionedObject<TId, TVersioned, TVersion, TObject>
        where TVersion: ObjectVersion<TId, TVersioned, TVersion, TObject>
    {
        internal protected IList<TVersion> _versions;

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
    }

    public class ObjectVersion<TId, TVersioned, TVersion, TObject>: DomainObject<TId>
        where TVersioned: VersionedObject<TId, TVersioned, TVersion, TObject>
        where TVersion: ObjectVersion<TId, TVersioned, TVersion, TObject>
    {
        public virtual TVersioned  Versioned { get; protected set; }
        public virtual int         Number    { get; protected set; }
        new public virtual TObject Object    { get; protected set; }

        protected ObjectVersion() : base()
        {
        }

        internal protected ObjectVersion(
            TVersioned versioned,
            TObject    @object
            )
        {
            Versioned._versions.Add((TVersion)this);
            Number = Versioned._versions.Count;
            Object = @object;
        }
    }
}

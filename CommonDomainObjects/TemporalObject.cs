using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CommonDomainObjects
{
    public interface ITemporalObject<TVersion>
    {
        IReadOnlyList<TVersion> Versions { get; }

        int AddVersion(TVersion version);
    }

    public class TemporalObjectVersion<TId, TTemporalObject, TVersion>: DomainObject<TId>
        where TTemporalObject : ITemporalObject<TVersion>
        where TVersion : TemporalObjectVersion<TId, TTemporalObject, TVersion>
    {
        public virtual TTemporalObject TemporalObject { get; protected set; }
        public virtual int             Number         { get; protected set; }

        protected TemporalObjectVersion() : base()
        {
        }

        public TemporalObjectVersion(
            TId             id,
            TTemporalObject temporalObject
            ) : base(id)
        {
            TemporalObject = temporalObject;
            Number         = TemporalObject.AddVersion((TVersion)this);
        }
    }

    public class TemporalObject<TId, TTemporalObject, TVersion>:
        DomainObject<TId>,
        ITemporalObject<TVersion>
        where TTemporalObject: TemporalObject<TId, TTemporalObject, TVersion>
        where TVersion: TemporalObjectVersion<TId, TTemporalObject, TVersion>
    {
        private IList<TVersion> _versions;

        public virtual int Number { get; protected set; }

        public virtual IReadOnlyList<TVersion> Versions
        {
            get
            {
                return new ReadOnlyCollection<TVersion>(_versions);
            }
        }

        protected TemporalObject() : base()
        {
        }

        public TemporalObject(
            TId id
            ) : base(id)
        {
            _versions = new List<TVersion>();
        }

        int ITemporalObject<TVersion>.AddVersion(
            TVersion version
            )
        {
            _versions.Add(version);
            Number = NextNumber();
            return Number;
        }

        protected virtual int NextNumber()
        {
            return Number + 1;
        }
    }

    public class TemporalObjectVersion<TId, TTemporalObject, TVersion, TObject>: TemporalObjectVersion<TId, TTemporalObject, TVersion>
        where TTemporalObject : ITemporalObject<TVersion>
        where TVersion : TemporalObjectVersion<TId, TTemporalObject, TVersion, TObject>
    {
        new public virtual TObject Object { get; protected set; }

        protected TemporalObjectVersion() : base()
        {
        }

        public TemporalObjectVersion(
            TId             id,
            TTemporalObject temporalObject,
            TObject         @object
            ) : base(
                id,
                temporalObject)
        {
            Object = @object;
        }
    }

    public class TemporalObjectVersion<TObject>: TemporalObjectVersion<Guid, TemporalObject<TObject>, TemporalObjectVersion<TObject>, TObject>
    {
        protected TemporalObjectVersion() : base()
        {
        }

        public TemporalObjectVersion(
            TemporalObject<TObject> versioned,
            TObject                 @object
            ) : base(
                Guid.NewGuid(),
                versioned,
                @object)
        {
        }
    }

    public class TemporalObject<TObject>: TemporalObject<Guid, TemporalObject<TObject>, TemporalObjectVersion<TObject>>
    {
        protected TemporalObject() : base()
        {
        }

        public TemporalObject(
            Guid id
            ) : base(id)
        {
        }
    }
}

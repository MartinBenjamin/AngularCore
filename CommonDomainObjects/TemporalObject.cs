using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CommonDomainObjects
{
    public class TemporalObject<TId, TTemporalObject, TVersion, TObject>: DomainObject<TId>
        where TTemporalObject: TemporalObject<TId, TTemporalObject, TVersion, TObject>
        where TVersion: TemporalObject<TId, TTemporalObject, TVersion, TObject>.Version
    {
        private IList<TVersion> _versions;

        public class Version: DomainObject<TId>
        {
            public virtual     TTemporalObject TemporalObject { get; protected set; }
            public virtual     int             Number         { get; protected set; }
            new public virtual TObject         Object         { get; protected set; }

            protected Version() : base()
            {
            }

            public Version(
                TId             id,
                TTemporalObject temporalObject,
                TObject         @object
                ) : base(id)
            {
                TemporalObject = temporalObject;
                TemporalObject._versions.Add((TVersion)this);
                Number         = TemporalObject.NextNumber();
                Object         = @object;
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

        protected TemporalObject() : base()
        {
        }

        public TemporalObject(
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

    public class TemporalObject<TObject>: TemporalObject<Guid, TemporalObject<TObject>, TemporalObject<TObject>.Version, TObject>
    {
        new public class Version: TemporalObject<Guid, TemporalObject<TObject>, Version, TObject>.Version
        {
            protected Version() : base()
            {
            }

            public Version(
                TemporalObject<TObject> versioned,
                TObject                 @object
                ) : base(
                    Guid.NewGuid(),
                    versioned,
                    @object)
            {
            }
        }

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

﻿using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CommonDomainObjects
{
    public class VersionedObject<TId, TVersioned, TVersionedVersion, TVersion>: DomainObject<TId>
        where TVersioned: VersionedObject<TId, TVersioned, TVersionedVersion, TVersion>
        where TVersionedVersion: VersionedObject<TId, TVersioned, TVersionedVersion, TVersion>.VersionedVersion
    {
        private IList<TVersionedVersion> _versions;

        public class VersionedVersion: DomainObject<TId>
        {
            public virtual TVersioned Versioned { get; protected set; }
            public virtual int        Number    { get; protected set; }
            public virtual TVersion   Version   { get; protected set; }

            protected VersionedVersion() : base()
            {
            }

            public VersionedVersion(
                TId        id,
                TVersioned versioned,
                TVersion   version
                ) : base(id)
            {
                Versioned = versioned;
                Versioned._versions.Add((TVersionedVersion)this);
                Number    = Versioned.NextNumber();
                Version   = version;
            }
        }

        public virtual int Number { get; protected set; }

        public virtual IReadOnlyList<TVersionedVersion> Versions
        {
            get
            {
                return new ReadOnlyCollection<TVersionedVersion>(_versions);
            }
        }

        protected VersionedObject() : base()
        {
        }

        public VersionedObject(
            TId id
            ) : base(id)
        {
            _versions = new List<TVersionedVersion>();
        }

        protected virtual int NextNumber()
        {
            return ++Number;
        }
    }

    public class VersionedObject<TVersion>: VersionedObject<Guid, VersionedObject<TVersion>, VersionedObject<TVersion>.VersionedVersion, TVersion>
    {
        new public class VersionedVersion: VersionedObject<Guid, VersionedObject<TVersion>, VersionedVersion, TVersion>.VersionedVersion
        {
            protected VersionedVersion() : base()
            {
            }

            public VersionedVersion(
                VersionedObject<TVersion> versioned,
                TVersion                  version
                ) : base(
                    Guid.NewGuid(),
                    versioned,
                    version)
            {
            }
        }

        protected VersionedObject() : base()
        {
        }

        public VersionedObject(
            Guid id
            ) : base(id)
        {
        }
    }
}

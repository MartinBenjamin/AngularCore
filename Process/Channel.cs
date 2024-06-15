using System;

namespace Process
{
    public class ChannelX
    {
        public string Name { get; protected set; }
        public Type   Type { get; protected set; }

        public ChannelX(
            string name,
            Type   type
            )
        {
            Name = name;
            Type = type;
        }

        public override bool Equals(
            object obj
            ) =>
            obj is ChannelX channel &&
            Name == channel.Name &&
            Type == channel.Type;

        public override int GetHashCode() => HashCode.Combine(
            Name,
            Type);

        public override string ToString() => Name;
    }
}

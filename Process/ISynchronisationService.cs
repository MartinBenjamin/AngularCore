using System.Collections.Generic;

namespace Process
{
    public interface ISynchronisationService
    {
        ICollection<Channel> AwaitIO { get; }

        Synchronisation Resolve(Channel channel);
    }
}

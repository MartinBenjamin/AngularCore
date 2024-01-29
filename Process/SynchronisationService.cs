using System.Collections.Generic;

namespace Process
{
    public class SynchronisationService: ISynchronisationService
    {
        private IDictionary<Channel, Synchronisation> _synchronisations = new Dictionary<Channel, Synchronisation>();

        ICollection<Channel> ISynchronisationService.AwaitIO => _synchronisations.Keys;

        Synchronisation ISynchronisationService.Resolve(
            Channel channel
            )
        {
            if(!_synchronisations.TryGetValue(
                channel,
                out var synchronisation))
            {
                synchronisation = new Synchronisation();
                _synchronisations[channel] = synchronisation;

            }
            return synchronisation;
        }
    }
}

using System.Collections.Generic;

namespace Process
{
    public class SynchronisationService: ISynchronisationService
    {
        private IDictionary<Definition.Channel, Synchronisation> _synchronisations = new Dictionary<Definition.Channel, Synchronisation>();

        Synchronisation ISynchronisationService.Resolve(
            Definition.Channel channel
            )
        {
            if(!_synchronisations.TryGetValue(
                channel,
                out var synchronisation))
            {
                synchronisation = new Synchronisation(channel);
                _synchronisations[channel] = synchronisation;

            }
            return synchronisation;
        }
    }
}

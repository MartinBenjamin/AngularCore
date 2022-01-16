import { InjectionToken, Provider } from '@angular/core';
import { EavStore } from '../../Ontology/EavStore';
import { IEavStore } from '../../Ontology/IEavStore';

export const EavStoreToken = new InjectionToken<IEavStore>('EavStoreToken');
export const EavStoreProvider: Provider =
{
    provide: EavStoreToken,
    useValue: new EavStore(
        {
            Name          : 'Id',
            UniqueIdentity: true
        })
};

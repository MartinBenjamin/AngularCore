import { InjectionToken, Provider } from '@angular/core';
import { EavStore } from '../../EavStore/EavStore';
import { IEavStore } from '../../EavStore/IEavStore';

export const EavStoreToken = new InjectionToken<IEavStore>('EavStoreToken');
export const EavStoreProvider: Provider =
{
    provide: EavStoreToken,
    useValue: new EavStore()
};

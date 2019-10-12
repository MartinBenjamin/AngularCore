interface Loadable
{
  Loaded: boolean;
}

export type LoadableArray<T> = Loadable & Array<T>;

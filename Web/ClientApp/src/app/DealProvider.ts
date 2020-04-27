import { Deal } from "./Deals";

export abstract class DealProvider
{
    abstract get Deal(): Deal;
}

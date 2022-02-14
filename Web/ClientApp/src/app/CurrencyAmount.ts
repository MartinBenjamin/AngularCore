import { Currency } from "./Iso4217";

export interface MonetaryAmount
{
    Currency: Currency,
    Amount  : number
}

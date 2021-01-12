import { Tab } from "../Components/TabbedView";
import { Deal } from "../Origination/Deal/Deal";
import { KeyCounterparties } from "../Origination/KeyCounterparties";
import { KeyDealData } from "../Origination/KeyDealData";
import { MoreTabs } from "../Origination/MoreTabs";
import { OriginationTab } from "../Origination/OriginationTab";
import { TransactionDetails } from "../Origination/TransactionDetails";

export interface IDealComponentBuilder
{
    AddAdvisoryTabs(dealComponent: Deal);
    AddDebtTabs(dealComponent: Deal);
}

export class DealComponentBuilder implements IDealComponentBuilder
{
    AddAdvisoryTabs(
        dealComponent: Deal
        )
    {
        dealComponent.Tabs =
            [
                new Tab('Key Deal<br/>Data'     , KeyDealData   ),
                new Tab('Fees &<br/>Income'     , OriginationTab),
                new Tab('Key<br/>Dates'         , OriginationTab),
                new Tab('Deal<br/>Team'         , OriginationTab),
                new Tab('Key<br/>Counterparties', OriginationTab)
            ];
    }

    AddDebtTabs(
        dealComponent: Deal
        )
    {
        dealComponent.Tabs =
            [
                new Tab('Key Deal<br/>Data'     , KeyDealData       ),
                new Tab('Transaction<br>Details', TransactionDetails),
                new Tab('Security'              , OriginationTab    ),
                new Tab('Fees &<br/>Income'     , OriginationTab    ),
                new Tab('Key<br/>Dates'         , OriginationTab    ),
                new Tab('Deal<br/>Team'         , OriginationTab    ),
                new Tab('Key<br/>Counterparties', KeyCounterparties ),
                new Tab('Syndicate<br/>Info'    , OriginationTab    ),
                new Tab('Key Risks &<br/>Events', OriginationTab    ),
                new Tab('More'                  , MoreTabs          )
            ];
    }
}

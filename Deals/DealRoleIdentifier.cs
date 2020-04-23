using System;

namespace Deals
{
    public static class DealRoleIdentifier
    {
        public static readonly Guid Borrower    = new Guid("664d48d3-5bb4-46a4-997a-f096b2030808");
        public static readonly Guid Lender      = new Guid("515cb087-21cf-417e-be1b-229585416015");
        public static readonly Guid Guarantor   = new Guid("6e4eacfb-27cd-4c83-8ce1-b3bf4043dc37");
        public static readonly Guid Advisor     = new Guid("32076ce7-7219-48c9-8be1-9e6754b034a6");
        public static readonly Guid Sponsor     = new Guid("00119e8c-e136-4aa8-a554-db0fcc09850a");


    }

    public static class DealTeamRoleIdentifier
    {
        public static readonly Guid Leader         = new Guid("1394234b-8153-410d-b775-07bada9536c5");
        public static readonly Guid Member         = new Guid("55df9bd2-c0c1-4690-be63-0dff1f887e81");
        public static readonly Guid WallStraddler  = new Guid("99dce2cc-4722-4606-b4a6-61210a6648fe");
        public static readonly Guid AccountOfficer = new Guid("430b921b-387d-42ed-a63b-410d923722ed");
    }
}

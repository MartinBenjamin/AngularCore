using System;

namespace Deals
{
    public static class DealRoleIdentifier
    {
        public static readonly Guid Borrower    = new Guid("664D48D3-5BB4-46A4-997A-F096B2030808");
        public static readonly Guid Lender      = new Guid("515CB087-21CF-417E-BE1B-229585416015");
        public static readonly Guid Guarantor   = new Guid("6E4EACFB-27CD-4C83-8CE1-B3BF4043DC37");
        public static readonly Guid Advisor     = new Guid("32076CE7-7219-48C9-8BE1-9E6754B034A6");
        public static readonly Guid Sponsor     = new Guid("00119E8C-E136-4AA8-A554-DB0FCC09850A");


    }

    public static class DealTeamRoleIdentifier
    {
        public static readonly Guid Leader         = new Guid("1394234B-8153-410D-B775-07BADA9536C5");
        public static readonly Guid Member         = new Guid("55DF9BD2-C0C1-4690-BE63-0DFF1F887E81");
        public static readonly Guid WallStraddler  = new Guid("99DCE2CC-4722-4606-B4A6-61210A6648FE");
        public static readonly Guid AccountOfficer = new Guid("430B921B-387D-42ED-A63B-410D923722ED");
    }
}

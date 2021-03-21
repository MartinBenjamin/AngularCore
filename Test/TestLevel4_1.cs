using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;

namespace Test
{
   public struct Direction
    {
        public int X { get; private set; }
        public int Y { get; private set; }

        public Direction(
            int x,
            int y
            )
        {
            X = x;
            Y = y;

            if(X != 0 || Y != 0)
            {
                int gcd = Gcd(
                    Math.Abs(X),
                    Math.Abs(Y));

                X /= gcd;
                Y /= gcd;
            }
        }

        public override bool Equals(
            object obj
            ) => obj is Direction direction &&
                X == direction.X &&
                Y == direction.Y;

        public override int GetHashCode()
            => HashCode.Combine(
                X,
                Y);

        public override string ToString() => $"[{ X }, { Y }]";

        public static bool operator ==(
            Direction lhs,
            Direction rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            Direction lhs,
            Direction rhs
            ) => !(lhs == rhs);

        public static int Gcd(
            int a,
            int b
            )
        {
            while(a != 0 && b != 0)
            {
                if(a > b)
                    a %= b;

                else
                    b %= a;
            }

            return a > 0 ? a : b;
        }
    }

    public struct DirectionComparer: IComparer<Direction>
    {
        int IComparer<Direction>.Compare(
            Direction x,
            Direction y
            ) => x.Y != y.Y ? y.Y - x.Y : y.X - x.X;
    }

    [TestFixture]
    public class TestLevel4_1: Test
    {
        private int[] LatticeRange(
            TestDataList<int> room,
            TestDataList<int> me,
            TestDataList<int> trainer,
            int               d,
            int               n
            )
        {
            /*
                Find range of m within distance d of me for given n.

                First apply reflections as necessary to the position of the trainer within the replicated room to yield an adjusted x_trainer and y_trainer.
                Then by Pythagoras:

                    (m * x_dim + x_trainer - x_me)^2 + (n * y_dim + y_trainer - y_me)^2 <= d^2
                    (m * x_dim + x_offset)^2 + (n * y_dim + y_offset)^2 <= d^2
                    (m * x_dim + x_offset)^2 <= d^2 - (n * y_dim + y_offset)^2
                    -(d^2 - (n * y_dim + y_offset)^2)^1/2 <= m * x_dim + x_offset <= (d^2 - (n * y_dim + y_offset)^2)^1/2
                    -((d^2 - (n * y_dim + y_offset)^2)^1/2 + x_offset) / x_dim <= m <= ((d^2 - (n * y_dim + y_offset)^2)^1/2 - x_offset) / x_dim

                Where x_offset = x_trainer - x_me and y_offset = y_trainer - y_me.
            */
            var yTrainer = n % 2 == 0 ? trainer[1] : room[1] - trainer[1];
            var yOffset = yTrainer - me[1];


            // Need to calculate ranges for both odd and even m and then combine the results in case one end of the range is even and the other odd.
            // Even m.
            var xTrainer = trainer[0];
            var xOffset = xTrainer - me[0];

            // Test if lattice point at m = 0 is reachable at this n.
            if(Math.Pow(n * room[1] + yOffset, 2) + Math.Pow(xOffset, 2) > Math.Pow(d, 2))
                return null;

            //var adjacentSquared = Math.Pow(d, 2) - Math.Pow(n * room[1] + yOffset, 2);
            //if(adjacentSquared < 0)
            //    return null;

            var adjacent = Math.Sqrt(Math.Pow(d, 2) - Math.Pow(n * room[1] + yOffset, 2));
            var evenUpper = (int)(adjacent - xOffset) / room[0];
            var evenLower = -(int)(adjacent + xOffset) / room[0];

            evenUpper = evenUpper % 2 == 0 ? evenUpper : evenUpper - 1;
            evenLower = evenLower % 2 == 0 ? evenLower : evenLower + 1;

            // Odd m.
            xTrainer = room[0] - trainer[0];
            xOffset = xTrainer - me[0];

            var oddUpper = (int)((adjacent - xOffset) / room[0]);
            var oddLower = -(int)((adjacent + xOffset) / room[0]);

            oddUpper = oddUpper % 2 == 0 ? oddUpper - 1: oddUpper;
            oddLower = oddLower % 2 == 0 ? oddLower + 1: oddLower;

            return new int[]
            {
                Math.Max(evenUpper, oddUpper),
                Math.Min(evenLower, oddLower)
            };
        }

        private void ProcessSemiCircle(
            TestDataList<int> room,
            TestDataList<int> me,
            TestDataList<int> trainer,
            int               distance,
            int               nStart,
            int               nIncrement,
            ISet<Direction>   included,
            ISet<Direction>   excluded
            )
        {
            var n = nStart;
            var latticeRange = LatticeRange(
                    room,
                    me,
                    trainer,
                    distance,
                    nStart);

            while(latticeRange != null)
            {
                var trainerY = (n % 2 == 0 ? trainer[1] : room[1] - trainer[1]) + n * room[1];
                var meY      = (n % 2 == 0 ? me[1]      : room[1] - me[1]     ) + n * room[1];

                var mEnd = me[0] == room[0] ? 0 : latticeRange[0];

                for(var m = 0;m <= mEnd;++m)
                {
                    var trainerX = (m % 2 == 0 ? trainer[0] : room[0] - trainer[0]) + m * room[0];                   
                    var meX = (m % 2 == 0 ? me[0] : room[0] - me[0]) + m * room[0];

                    var trainerDirection = new Direction(
                        trainerX - me[0],
                        trainerY - me[1]);
                    var myDirection = new Direction(
                        meX - me[0],
                        meY - me[1]);

                    if(!(trainerDirection == myDirection &&
                         (Math.Abs(meX) < Math.Abs(trainerX) ||
                          Math.Abs(meY) < Math.Abs(trainerY))) &&
                       !excluded.Contains(trainerDirection))
                         included.Add(trainerDirection);

                    excluded.Add(myDirection);
                }

                mEnd = me[0] == 0 ? 0 : latticeRange[1];
                    
                for(var m = -1;m >= mEnd;--m)
                {
                    var trainerX = (m % 2 == 0 ? trainer[0] : room[0] - trainer[0]) + m * room[0];                   
                    var meX      = (m % 2 == 0 ? me[0]      : room[0] - me[0]     ) + m * room[0];

                    var trainerDirection = new Direction(
                        trainerX - me[0],
                        trainerY - me[1]);
                    var myDirection = new Direction(
                        meX - me[0],
                        meY - me[1]);

                    if(!(trainerDirection == myDirection &&
                         (Math.Abs(meX) < Math.Abs(trainerX) ||
                          Math.Abs(meY) < Math.Abs(trainerY))) &&
                       !excluded.Contains(trainerDirection))
                         included.Add(trainerDirection);

                    excluded.Add(myDirection);
                }

                n += nIncrement;
                latticeRange = LatticeRange(
                    room,
                    me,
                    trainer,
                    distance,
                    n);
            }
        }

        private ISet<Direction> Directions(
            TestDataList<int> room,
            TestDataList<int> me,
            TestDataList<int> trainer,
            int               distance       
            )
        {
            /*
                If room is repeatedly replicated by reflection in each of it walls, then the trainer will form a lattice given by:

                    x = m * x_dim + x_trainer for even m:Z,
                    x = m * x_dim + (x_dim - x_trainer) for odd m:Z,

                    y = n * y_dim + y_trainer for even n:Z,
                    y = n * y_dim + (y_dim - y_trainer) for odd n:Z.

                Or:

                    x = m * x_dim + R(m, x_dim, x_trainer),
                    y = n * y_dim + R(n, y_dim, y_trainer).

                Where R(m, x_dim, x_trainer) is x_trainer for even m and x_dim - x_trainer for odd m.  A similar lattice
                will be formed by myself.

                Need to find all distinct trainer lattice point directions for lattice points on or within the maximum distance d from me.
                Need to exclude trainer lattice points hidden by my lattice points.
            */

            var included = new SortedSet<Direction>(new DirectionComparer());
            var excluded = new SortedSet<Direction>(new DirectionComparer());

            if(me[1] == 0)
                ProcessSemiCircle(
                    room,
                    me,
                    trainer,
                    distance,
                    0,
                    1,
                    included,
                    excluded);

            else if(me[1] == room[1])
                ProcessSemiCircle(
                    room,
                    me,
                    trainer,
                    distance,
                    0,
                    -1,
                    included,
                    excluded);

            else
            {
                ProcessSemiCircle(
                    room,
                    me,
                    trainer,
                    distance,
                    0,
                    1,
                    included,
                    excluded);

                ProcessSemiCircle(
                    room,
                    me,
                    trainer,
                    distance,
                    -1,
                    -1,
                    included,
                    excluded);
            }

            return included;
        }
        private int CountDirections(
            TestDataList<int> room,
            TestDataList<int> me,
            TestDataList<int> trainer,
            int               distance       
            )
        {
            /*
                If room is repeatedly replicated by reflection in each of it walls, then the trainer will form a lattice given by:

                    x = m * x_dim + x_trainer for even m:Z,
                    x = m * x_dim + (x_dim - x_trainer) for odd m:Z,

                    y = n * y_dim + y_trainer for even n:Z,
                    y = n * y_dim + (y_dim - y_trainer) for odd n:Z.

                Or:

                    x = m * x_dim + R(m, x_dim, x_trainer),
                    y = n * y_dim + R(n, y_dim, y_trainer).

                Where R(m, x_dim, x_trainer) is x_trainer for even m and x_dim - x_trainer for odd m.

                Need to find all (visible) trainer lattice points on or within the maximum distance d from me.
                Assume that visibility may only be restricted on the x and y axes.
            */

            var total = 0;
            var n = 0;
            if(me[1] == trainer[1])
            {
                // Only one direction for n = 0.
                n = 1;
                total += 1;
            }

            var excludeVertical = me[0] == trainer[0];

            if(excludeVertical)
                // Only one direction for m = 0.
                total += 1;

            var latticeRange = LatticeRange(
                    room,
                    me,
                    trainer,
                    distance,
                    n++);

            while(latticeRange != null)
            {
                total += latticeRange[0] - latticeRange[1] + 1;

                if(excludeVertical)
                    total -= 1;

                latticeRange = LatticeRange(
                    room,
                    me,
                    trainer,
                    distance,
                    n++);
            }

            n = -1;
            latticeRange = LatticeRange(
                room,
                me,
                trainer,
                distance,
                n--);

            while(latticeRange != null)
            {
                total += latticeRange[0] - latticeRange[1] + 1;

                if(excludeVertical)
                    total -= 1;

                latticeRange = LatticeRange(
                    room,
                    me,
                    trainer,
                    distance,
                    n--);
            }

            return total;
        }

        [TestCaseSource("TestCases")]
        public void Test(
            TestDataList<int> room,
            TestDataList<int> me,
            TestDataList<int> trainer,
            int               distance,
            int               expected
            )
        {
            var directions = Directions(
                    room,
                    me,
                    trainer,
                    distance);

            foreach(var direction in directions)
                TestContext.WriteLine(direction);

            Assert.That(directions.Count, Is.EqualTo(expected));

            //Assert.That(
            //    CountDirections(
            //        room,
            //        me,
            //        trainer,
            //        distance), Is.EqualTo(expected));
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        new TestDataList<int>{ 3, 2 },
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 2, 1 },
                        4,
                        7
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 3, 2 },
                        new TestDataList<int>{ 2, 1 },
                        new TestDataList<int>{ 1, 1 },
                        4,
                        7
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 3 },
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 1, 2 },
                        4,
                        7
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 3 },
                        new TestDataList<int>{ 1, 2 },
                        new TestDataList<int>{ 1, 1 },
                        4,
                        7
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 300, 275 },
                        new TestDataList<int>{ 150, 150 },
                        new TestDataList<int>{ 185, 100 },
                        500,
                        9
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 275, 300 },
                        new TestDataList<int>{ 150, 150 },
                        new TestDataList<int>{ 100, 185 },
                        500,
                        9
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 2 },
                        new TestDataList<int>{ 0, 1 },
                        new TestDataList<int>{ 1, 1 },
                        3,
                        3
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 2 },
                        new TestDataList<int>{ 2, 1 },
                        new TestDataList<int>{ 1, 1 },
                        3,
                        3
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 2 },
                        new TestDataList<int>{ 1, 0 },
                        new TestDataList<int>{ 1, 1 },
                        3,
                        3
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 2 },
                        new TestDataList<int>{ 1, 2 },
                        new TestDataList<int>{ 1, 1 },
                        3,
                        3
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 2, 2 },
                        new TestDataList<int>{ 0, 1 },
                        new TestDataList<int>{ 1, 1 },
                        4,
                        5
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 0, 0 },
                        new TestDataList<int>{ 1, 1 },
                        4,
                        3
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 0, 0 },
                        4,
                        3
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 0, 0 },
                        new TestDataList<int>{ 1, 1 },
                        3,
                        1
                    },
                    new object[]
                    {
                        new TestDataList<int>{ 1, 1 },
                        new TestDataList<int>{ 0, 0 },
                        new TestDataList<int>{ 1, 1 },
                        1,
                        0
                    }
                };
            }
        }
    }
}

using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    [TestFixture]
    public class TestLevel4: Test
    {
        public void Initialise(
            int[] combination
            )
        {
            for(var index = 0;index < combination.Length;index++)
                combination[index] = index;
        }

        public bool Increment(
            int   n,
            int[] combination
            )
        {
            // Find largest index that can be incremented.
            int largestIndex = -1;
            for(var index = 0;index < combination.Length;++index)
                if(combination[index] != n - combination.Length + index)
                    largestIndex = Math.Max(largestIndex, index);

            if(largestIndex == -1)
                return false;

            var value = combination[largestIndex];
            for(var index = 0;index + largestIndex < combination.Length;++index)
                combination[largestIndex + index] = value + index + 1;

            return true;
        }

        [TestCaseSource("TestCases")]
        public void Test(
            int               numBuns,
            int               numRequired,
            IList<IList<int>> expected
            )
        {
            var n = 10;
            var r = 6;

            var combination = new int[r];
            Initialise(combination);
            IList<int[]> combinations = new List<int[]>();
            var generating = true;
            while(generating)
            {
                combinations.Add((int[])combination.Clone());
                TestContext.WriteLine(new TestDataList<int>(combination));

                generating = Increment(
                   n,
                   combination);
            }
            TestContext.WriteLine(combinations.Count);

            combination = new int[numBuns];
            Initialise(combination);
            int count = 0;
            var numRequiredcombination = new int[numRequired];
            var numRequiredMinusOneCombination = new int[numRequired - 1];
            var isPresent = new bool[n];
            while(combination[0] == 0)
            {
                count++;
                if(count == 100000000)
                    break;

                Initialise(numRequiredcombination);

                bool pass = true;
                bool testing = true;
                // Every choice of numRequired must have all elements.
                while(
                    pass &&
                    testing)
                {
                    Array.Fill(
                        isPresent,
                        false);

                    foreach(var index in numRequiredcombination)
                    {
                        var keyCombination = combinations[combination[index]];
                        foreach(var key in keyCombination)
                            isPresent[key] = true;
                    }

                    pass = Array.TrueForAll(isPresent, p => p);
                    if(pass)
                        testing = Increment(
                            numBuns,
                            numRequiredcombination);
                }

                if(pass)
                {
                    // Every choice of numRequired - 1 must not have all elements;
                    Initialise(numRequiredMinusOneCombination);
                    testing = true;
                    while(
                        pass &&
                        testing)
                    {
                        Array.Fill(
                            isPresent,
                            false);

                        foreach(var index in numRequiredMinusOneCombination)
                        {
                            var keyCombination = combinations[combination[index]];
                            foreach(var key in keyCombination)
                                isPresent[key] = true;
                        }

                        pass = !Array.TrueForAll(isPresent, p => p);
                        if(pass)
                            testing = Increment(
                                numBuns,
                                numRequiredMinusOneCombination);
                    }
                }

                if(pass)
                    break;

                Increment(
                   combinations.Count,
                   combination);
            }

            if(combination[0] == 0)
            {
                foreach(var index in combination)
                    TestContext.WriteLine(new TestDataList<int>(combinations[index]));

                Assert.That(combination.Length, Is.EqualTo(expected.Count));
                for(var index = 0;index < combination.Length;index++)
                {
                    var keyCombination = combinations[combination[index]];
                    for(var index2 = 0;index2 < keyCombination.Length;index2++)
                        Assert.That(keyCombination[index2], Is.EqualTo(expected[index][index2]));
                }
            }

            TestContext.WriteLine(count);
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        2,
                        1,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 0 }
                        }
                    },
                    new object[]
                    {
                        2,
                        2,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1 },
                            new TestDataList<int>{ 0, 2 },
                            new TestDataList<int>{ 1, 2 }
                        }
                    },
                    new object[]
                    {
                        4,
                        4,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0 },
                            new TestDataList<int>{ 1 },
                            new TestDataList<int>{ 2 },
                            new TestDataList<int>{ 3 }
                        }
                    },
                    new object[]
                    {
                        5,
                        3,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 2, 3, 4, 5 },
                            new TestDataList<int>{ 0, 1, 2, 6, 7, 8 },
                            new TestDataList<int>{ 0, 3, 4, 6, 7, 9 },
                            new TestDataList<int>{ 1, 3, 5, 6, 8, 9 },
                            new TestDataList<int>{ 2, 4, 5, 7, 8, 9 }
                        }
                    }
                };
            }
        }

    }
}

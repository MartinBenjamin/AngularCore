﻿using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Test
{
    public struct Fraction
    {
        public int Numerator   { get; private set; }
        public int Denominator { get; private set; }

        public static readonly Fraction Zero = new Fraction(0);
        public static readonly Fraction One  = new Fraction(1);

        public Fraction(
            int numerator,
            int denominator = 1
            )
        {
            Numerator   = numerator;
            Denominator = numerator == 0 ? 1 : denominator;

            int gcd = Gcd(
                Math.Abs(Numerator),
                Denominator);

            Numerator   /= gcd;
            Denominator /= gcd;
        }

        public bool IsZero
        {
            get
            {
                return Numerator == 0;
            }
        }

        public bool IsOne
        {
            get
            {
                return Numerator == Denominator;
            }
        }

        public static Fraction operator -(
            Fraction fraction
            ) => new Fraction(
                -fraction.Numerator,
                fraction.Denominator);

        public static Fraction operator +(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                lhs.Numerator * rhs.Denominator + rhs.Numerator * lhs.Denominator,
                lhs.Denominator * rhs.Denominator);

        public static Fraction operator -(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                lhs.Numerator * rhs.Denominator - rhs.Numerator * lhs.Denominator,
                lhs.Denominator * rhs.Denominator);

        public static Fraction operator*(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                lhs.Numerator * rhs.Numerator,
                lhs.Denominator * rhs.Denominator);

        public static Fraction operator/(
            Fraction lhs,
            Fraction rhs
            ) => new Fraction(
                lhs.Numerator * (rhs.Numerator < 0 ? -rhs.Denominator : rhs.Denominator),
                lhs.Denominator * Math.Abs(rhs.Numerator));

        public Fraction Simplify()
        {
            int gcfCandidate = Math.Min(Math.Abs(Numerator), Denominator);

            while(gcfCandidate > 1)
            {
                if(Numerator % gcfCandidate == 0 &&
                   Denominator % gcfCandidate == 0)
                    return new Fraction(
                        Numerator /= gcfCandidate,
                        Denominator /= gcfCandidate);

                gcfCandidate -= 1;
            }

            return this;
        }

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

        public override string ToString() => Numerator != 0 && Denominator != 1 ? $"{ Numerator }/{ Denominator }" : Numerator.ToString();
    }

    public struct Matrix
    {
        private IDictionary<int, IDictionary<int, Fraction>> _elements;

        public Matrix(
            ICollection<int> rowIndices,
            ICollection<int> columnIndices
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(rowIndices.Count);

            foreach(var rowIndex in rowIndices)
            {
                var row = new Dictionary<int, Fraction>(columnIndices.Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in columnIndices)
                    row[columnIndex] = Fraction.Zero;
            }
        }

        public Matrix(
            IDictionary<int, IDictionary<int, Fraction>> elements
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(elements.Count);

            foreach(var rowIndex in elements.Keys)
            {
                var row = new Dictionary<int, Fraction>(elements[rowIndex].Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in elements[rowIndex].Keys)
                    row[columnIndex] = elements[rowIndex][columnIndex];
            }
        }

        public Matrix(
            IList<IList<Fraction>> elements
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(elements.Count);

            foreach(var rowIndex in Enumerable.Range(0, elements.Count))
            {
                var row = new Dictionary<int, Fraction>(elements[rowIndex].Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in Enumerable.Range(0, elements[rowIndex].Count))
                    row[columnIndex] = elements[rowIndex][columnIndex];
            }
        }

        public Matrix(
            IList<IList<int>> elements
            )
        {
            _elements = new Dictionary<int, IDictionary<int, Fraction>>(elements.Count);

            foreach(var rowIndex in Enumerable.Range(0, elements.Count))
            {
                var row = new Dictionary<int, Fraction>(elements[rowIndex].Count);
                _elements[rowIndex] = row;
                foreach(var columnIndex in Enumerable.Range(0, elements[rowIndex].Count))
                    row[columnIndex] = new Fraction(elements[rowIndex][columnIndex]);
            }
        }

        public Fraction this[
            int rowIndex,
            int columnIndex
            ]
        {
            get
            {
                return _elements[rowIndex][columnIndex];
            }
        }

        public ICollection<int> RowIndices
        {
            get
            {
                return _elements.Keys;
            }
        }

        public ICollection<int> ColumnIndices
        {
            get
            {
                return _elements.First().Value.Keys;
            }
        }

        public Matrix Identity()
        {
            var result = new Matrix(
                RowIndices,
                ColumnIndices);
            foreach(var rowIndex in _elements.Keys)
                foreach(var columnIndex in _elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] = rowIndex == columnIndex ? Fraction.One : Fraction.Zero;

            return result;
        }

        public Matrix Normalise()
        {
            var result = new Matrix(_elements);
            foreach(var rowIndex in _elements.Keys)
            {
                var row = _elements[rowIndex];
                var total = row
                    .Values
                    .Aggregate(
                        Fraction.Zero,
                        (accumulator, current) => accumulator + current);

                if(!total.IsZero)
                    foreach(var columnIndex in row.Keys)
                        result._elements[rowIndex][columnIndex] /= total;

                else // Absorbing state.
                    result._elements[rowIndex][rowIndex] = Fraction.One;
            }

            return result;
        }

        public Matrix Submatrix(
            IList<int> rowIndices,
            IList<int> columnIndices
            )
        {
            var result = new Matrix(
                rowIndices,
                columnIndices);

            foreach(var rowIndex in rowIndices)
            {
                var row = result._elements[rowIndex];
                foreach(var columnIndex in columnIndices)
                    row[columnIndex] = _elements[rowIndex][columnIndex];
            }

            return result;
        }

        public Fraction Det()
        {
            var rowIndices = _elements.Keys.ToList();
            return Det(
                rowIndices,
                rowIndices);
        }

        private Fraction Det(
            IList<int> rowIndices,
            IList<int> columnIndices
            )
        {
            if(rowIndices.Count == 1)
                return _elements[rowIndices[0]][columnIndices[0]];

            var determinant = Fraction.Zero;
            var rowIndex = rowIndices[0];
            for(var columnIndexIndex = 0;columnIndexIndex < columnIndices.Count;++columnIndexIndex)
            {
                var columnIndex        = columnIndices[columnIndexIndex];
                var element            = _elements[rowIndex][columnIndex];
                var minorRowIndices    = rowIndices.Where(index => index != rowIndex).ToList();
                var minorColumnIndices = columnIndices.Where(index => index != columnIndex).ToList();
                var minor = Det(
                        minorRowIndices,
                        minorColumnIndices);

                if(columnIndexIndex % 2 == 0)
                    determinant += element * minor;

                else
                    determinant -= element * minor;
            }

            return determinant;
        }

        public Matrix Adj()
        {
            var rowIndices = _elements.Keys.ToList();
            var adj = new Matrix(
                rowIndices,
                rowIndices);

            // Calculate cofactors.
            for(var rowIndexIndex = 0;rowIndexIndex < rowIndices.Count;++rowIndexIndex)
                for(var columnIndexIndex = 0;columnIndexIndex < rowIndices.Count;++columnIndexIndex)
                {
                    var rowIndex    = rowIndices[rowIndexIndex   ];
                    var columnIndex = rowIndices[columnIndexIndex];
                    var minorRowIndices    = rowIndices.Where(index => index != rowIndex   ).ToList();
                    var minorColumnIndices = rowIndices.Where(index => index != columnIndex).ToList();

                    var cofactorValue = Det(
                        minorRowIndices,
                        minorColumnIndices);

                    adj._elements[columnIndex][rowIndex] = (rowIndexIndex + columnIndexIndex) % 2 == 0 ?
                        cofactorValue : -cofactorValue;
                }

            return adj;
        }

        private Matrix Invert1X1()
        {
            var rowIndices = _elements.Keys.ToList();
            var inverse = new Matrix(
                rowIndices,
                rowIndices);
            inverse._elements[rowIndices[0]][rowIndices[0]] = Fraction.One / _elements[rowIndices[0]][rowIndices[0]];
            return inverse;
        }

        public Matrix Invert() => _elements.Count == 1 ? Invert1X1() : (Fraction.One / Det()) * Adj();

        public static Matrix operator +(
            Matrix lhs,
            Matrix rhs
            )
        {
            var result = new Matrix(lhs._elements);
            foreach(var rowIndex in lhs._elements.Keys)
                foreach(var columnIndex in lhs._elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] += rhs._elements[rowIndex][columnIndex];

            return result;
        }

        public static Matrix operator -(
            Matrix lhs,
            Matrix rhs
            )
        {
            var result = new Matrix(lhs._elements);
            foreach(var rowIndex in lhs._elements.Keys)
                foreach(var columnIndex in lhs._elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] -= rhs._elements[rowIndex][columnIndex];

            return result;
        }

        public static Matrix operator *(
            Matrix lhs,
            Matrix rhs
            )
        {
            var rowIndices    = lhs.RowIndices.ToList();
            var columnIndices = rhs.ColumnIndices.ToList();
            var result = new Matrix(
                rowIndices,
                columnIndices);
            foreach(var rowIndex in rowIndices)
            {
                var row = result._elements[rowIndex];
                foreach(var columnIndex in columnIndices)
                    foreach(var index in rhs._elements.Keys)
                        row[columnIndex] += lhs._elements[rowIndex][index] * rhs._elements[index][columnIndex];
            }

            return result;
        }

        public static Matrix operator *(
            Fraction lhs,
            Matrix   rhs
            )
        {
            var result = new Matrix(rhs._elements);
            foreach(var rowIndex in rhs._elements.Keys)
                foreach(var columnIndex in rhs._elements[rowIndex].Keys)
                    result._elements[rowIndex][columnIndex] = rhs._elements[rowIndex][columnIndex] * lhs;

            return result;
        }

        public override string ToString()
        {
            var builder = new StringBuilder();
            foreach(var rowIndex in _elements.Keys.OrderBy(key => key))
            {
                var row = _elements[rowIndex];
                foreach(var columnIndex in row.Keys.OrderBy(key => key))
                {
                    builder.Append('\t');
                    builder.Append(_elements[rowIndex][columnIndex].ToString());
                }

                builder.AppendLine(string.Empty);
            }

            return builder.ToString();
        }
    }

    [TestFixture]
    public class TestLevel3_1: Test
    {
        public IList<int> Probabilities(
            int               initialState,
            IList<IList<int>> matrix
            )
        {
            var t = new Matrix(matrix);
            TestContext.WriteLine("Given Transition Matrix:");
            TestContext.WriteLine(t);

            t = t.Normalise();
            TestContext.WriteLine("Normalised Transition Matrix:");
            TestContext.WriteLine(t);

            var transientStates = t.RowIndices.Where(rowIndex => !t[rowIndex, rowIndex].IsOne).ToList();
            var absorbingStates = t.RowIndices.Where(rowIndex => t[rowIndex, rowIndex].IsOne).ToList();
            var q = t.Submatrix(transientStates, transientStates);
            var r = t.Submatrix(transientStates, absorbingStates);
            TestContext.WriteLine("Q:");
            TestContext.WriteLine(q);

            TestContext.WriteLine("R:");
            TestContext.WriteLine(r);

            var qIdentity = q.Identity();
            TestContext.WriteLine("I:");
            TestContext.WriteLine(qIdentity);

            var iMinusQ = qIdentity - q;
            TestContext.WriteLine("I - Q:");
            TestContext.WriteLine(iMinusQ);
            TestContext.WriteLine(iMinusQ.Det());

            var n = iMinusQ.Invert();
            TestContext.WriteLine("N = (I - Q)^-1:");
            TestContext.WriteLine(n);

            var b = n * r;
            TestContext.WriteLine("B = NR:");
            TestContext.WriteLine(b);

            var denominators = new HashSet<int>();
            foreach(var columnIndex in b.ColumnIndices)
            {
                var element = b[initialState, columnIndex];
                if(!element.IsZero)
                    denominators.Add(element.Denominator);
            }

            TestContext.Write("Denominators: ");
            TestContext.WriteLine(new TestDataList<int>(denominators));

            var lcm = denominators.Aggregate((lhs, rhs) => lhs * rhs / Fraction.Gcd(lhs, rhs));
            TestContext.WriteLine("LCD: " + lcm);

            var result = new TestDataList<int>();
            foreach(var columnIndex in b.ColumnIndices)
            {
                var element = b[initialState, columnIndex];
                result.Add(element.Numerator * lcm / element.Denominator);
            }

            result.Add(lcm);
            TestContext.WriteLine("Result: " + result);
            return result;
        }

        [TestCaseSource("TestCases")]
        public void Test(
            int               initialState,
            IList<IList<int>> matrix,
            IList<int>        expected
            )
        {
            var result = Probabilities(
                initialState,
                matrix);
            Assert.That(result.SequenceEqual(expected), Is.True);
        }

        public static IEnumerable<object[]> TestCases
        {
            get
            {
                return new List<object[]>
                {
                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1 },
                            new TestDataList<int>{ 0, 1 }
                        },
                        new TestDataList<int>{ 1, 1 }
                    },

                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 1 },
                            new TestDataList<int>{ 0, 1, 0 },
                            new TestDataList<int>{ 0, 0, 1 }
                        },
                        new TestDataList<int>{ 1, 1, 2 }
                    },

                    new object[]
                    {
                        1,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 1, 0, 0, 0, 0 },
                            new TestDataList<int>{ 1, 0, 1, 0, 0 },
                            new TestDataList<int>{ 0, 1, 0, 1, 0 },
                            new TestDataList<int>{ 0, 0, 1, 0, 1 },
                            new TestDataList<int>{ 0, 0, 0, 0, 1 },
                        },
                        new TestDataList<int>{ 3, 1, 4 }
                    },

                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 2, 1, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 3, 4 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0 },
                        },
                        new TestDataList<int>{ 7, 6, 8, 21 }
                    },

                    new object[]
                    {
                        0,
                        new TestDataList<IList<int>>
                        {
                            new TestDataList<int>{ 0, 1, 0, 0, 0, 1 },
                            new TestDataList<int>{ 4, 0, 0, 3, 2, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 },
                            new TestDataList<int>{ 0, 0, 0, 0, 0, 0 }
                        },
                        new TestDataList<int>{ 0, 3, 2, 9, 14 }
                    }
                };
            }
        }
    }
}

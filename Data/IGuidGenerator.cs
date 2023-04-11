using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace Data
{
    public interface IGuidGenerator
    {
        Guid Generate(
            Guid   namespaceId,
            byte[] name);

        Guid Generate(
            Guid     namespaceId,
            string   name,
            Encoding encoding = null);
    }

    public class GuidGenerator: IGuidGenerator
    {
        private HashAlgorithm _hashAlgorithm;

        public GuidGenerator(
            HashAlgorithm hashAlgorithm
            )
        {
            _hashAlgorithm = hashAlgorithm;
        }

        public Guid Generate(
            Guid   namespaceId,
            byte[] name
            )
        {
            var namespaceBytes = namespaceId.ToByteArray();
            SwapByteOrder(namespaceBytes);

            // Compute the hash of the name space ID concatenated with the name (step 4).
            var hash = _hashAlgorithm.ComputeHash(namespaceBytes.Concat(name).ToArray());

            // Most bytes from the hash are copied straight to the bytes of the new GUID (steps 5-7, 9, 11-12)
            var newGuid = hash.Take(16).ToArray();

            // Set the four most significant bits (bits 12 through 15) of the time_hi_and_version field to the appropriate 4-bit version number from Section 4.1.3 (step 8)
            newGuid[6] = (byte)((newGuid[6] & 0x0F) | (5 << 4));

            // Set the two most significant bits (bits 6 and 7) of the clock_seq_hi_and_reserved to zero and one, respectively (step 10)
            newGuid[8] = (byte)((newGuid[8] & 0x3F) | 0x80);

            // Convert the resulting UUID to local byte order (step 13)
            SwapByteOrder(newGuid);
            return new Guid(newGuid);
        }

        Guid IGuidGenerator.Generate(
            Guid     namespaceId,
            string   name,
            Encoding encoding
            ) => Generate(
                namespaceId,
                (encoding ?? Encoding.UTF8).GetBytes(name));

        private static void SwapByteOrder(
            byte[] guid
            )
        {
            SwapBytes(guid, 0, 3);
            SwapBytes(guid, 1, 2);
            SwapBytes(guid, 4, 5);
            SwapBytes(guid, 6, 7);
        }

        private static void SwapBytes(
            byte[] guid,
            int    left,
            int    right
            )
        {
            var temp = guid[left];
            guid[left] = guid[right];
            guid[right] = temp;
        }
    }
}

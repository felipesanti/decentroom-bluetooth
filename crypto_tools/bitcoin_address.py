#! usr/bin/python3

"Source: Mastering Bitcoin, Andreas Antonopoulos, page 83"

import bitcoin

mockup = True

# generate a random key
valid_private_key = False
while not valid_private_key:
    if mockup == True:
        private_key = '3aba4162c7251c891207b747840551a71939b0de081f85c4e44cf7c13e41daa6'
    else:
        private_key = bitcoin.random_key()
    decoded_private_key = bitcoin.decode_privkey(private_key, 'hex')
    valid_private_key = 0 < decoded_private_key < bitcoin.N

print('Private key (hex) is: ', private_key)
print('Private key (decimal) is: ', decoded_private_key)

# Convert private key to WIF format
wif_encoded_private_key = bitcoin.encode_privkey(decoded_private_key, 'wif')
print('Private key (WIF) is: ', wif_encoded_private_key)

# Add suffix "01" to indicate a compressed private key
compressed_private_key = private_key + '01'
print('Private key Compressed (hex) is: ', compressed_private_key)

# Generate a WIF format from the compressed private key (WIF-compressed)
wif_compressed_private_key = bitcoin.encode_privkey(
        bitcoin.decode_privkey(compressed_private_key, 'hex'), 'wif')
print('Private key (WIF-Compressed)  is: ', wif_compressed_private_key)

# Multiply the EC generator point G with the private key to get a public key point
public_key = bitcoin.fast_multiply(bitcoin.G, decoded_private_key)
print('Public key (x,y)  coordinates is: ', public_key)

# Encode as hex, prefix 04
hex_encoded_public_key = bitcoin.encode_pubkey(public_key,'hex')
print('Public key (hex) is: ', hex_encoded_public_key)

# Compress public key, adjust prefix depending on whether y is even or odd
(public_key_x, public_key_y) = public_key
if (public_key_y %2 ) == 0:
    compressed_prefix = '02'
else:
    compressed_prefix = '03'

hex_compressed_public_key = compressed_prefix + bitcoin.encode(public_key_x, 16)
print('Compressed Public key (hex) is: ', hex_compressed_public_key)

# Generate bitcoin address from public key
print ("Bitcoin address (b58check) is:", bitcoin.pubkey_to_address(hex_compressed_public_key))



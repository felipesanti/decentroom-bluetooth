#! /usr/bin/python3

"""
BITCOIN SIGNING TOOLS
File: bitcoin_sign.py
Author:Felipe Santi
Date: 14 May 2017
Based on stackoverflow 34451214
Example: $ python bitcoin_sign.py
http://stackoverflow.com/questions/6624453/whats-the-correct-way-to-convert-bytes-to-a-hex-string-in-python-3
"""
# TODO; Add custom messages

from ecdsa import SigningKey, SECP256k1
import binascii, codecs

# SECP256k1 is the bitcoin elliptic curve
# use this to generate new signature key 
# sk = SigningKey.generate(curve=SECP256k1)
sk = SigningKey.from_string(bytes.fromhex('3aba4162c7251c891207b747840551a71939b0de081f85c4e44cf7c13e41daa6'), curve=SECP256k1)
print("signing key (private key) = ", codecs.encode(sk.to_string(),'hex').decode('ascii'))
pubkey = sk.get_verifying_key()
print("verifying key (public key) = ", codecs.encode(pubkey.to_string(),'hex').decode('ascii'))
message = b"inventrip"
print("message = ", message.decode('ascii'))
signature = sk.sign(message)
print("signature = ", codecs.encode(signature,'hex').decode('ascii'))
if (pubkey.verify(signature, message)):
    print("""
    *** VERIFICATION OK ***
    
    To double check run this script: 
    
    """)
    print("python ecdsa_verify.py -s '", codecs.encode(signature,'hex').decode('ascii'), "' -m '", message.decode('ascii'), "' -p '", codecs.encode(pubkey.to_string(),'hex').decode('ascii'), "'", sep='')
else:
    print("Verification NOK - please check script")



#! /usr/bin/python3

"""
BITCOIN VERIFY TOOLS
File: bitcoin_verify.py
Author: Felipe Santi
Date: 14 May 2017
Based on stackoverflow 34451214
Examples (run in bash): 
python bitcoin_verify.py -s '740894121e1c7f33b174153a7349f6899d0a1d2730e9cc59f674921d8aef73532f63edb9c5dba4877074a937448a37c5c485e0d53419297967e95e9b1bef630d' -m 'message' -p '98cedbb266d9fc38e41a169362708e0509e06b3040a5dfff6e08196f8d9e49cebfb4f4cb12aa7ac34b19f3b29a17f4e5464873f151fd699c2524e0b7843eb383'
<returns True>


"""

import sys, getopt, binascii, codecs
from ecdsa import VerifyingKey, SECP256k1,BadSignatureError


def verify(sig, message, public_key):
    print("public key = ", public_key)
    print("message = ", message.decode('ascii'))
    print("signature = ", sig)
    vk = VerifyingKey.from_string(bytes.fromhex(public_key), curve=SECP256k1)
    try:
        vk.verify(bytes.fromhex(sig), message)
        return True
    except BadSignatureError:
        return False

def main(argv):
    print("""
    *** SIGNATURE VERIFICATION ***
    """)
    try:
        # check the right arguments are passed (mandatory arguments: -s, -m, -p)
        opts, args = getopt.getopt(argv,"hs:m:p:",["signature=","message=","pubkey="])
    except getopt.GetoptError:
        print("bitcoin_verify.py -s 'signature hex string' -m 'message string' -p 'public key hex'")
        sys.exit(2)
    
    # TODO: check that required arguments are there
    
    # pick up the arguments
    for opt, arg in opts:
        if opt == '-h':
            print("bitcoin_verify.py -s 'signature hex string' -m 'message string' -p 'public key hex'")
            sys.exit()
        elif opt in ("-s", "--signature"):
            s = arg
        elif opt in ("-m", "--message"):
            m = arg.encode('utf8')
        elif opt in ("-p", "--pubkey"):
            pubkey = arg
    
    # call the verifying function and print the result
    result = verify(s,m,pubkey)
    print()
    if result:
        print("*** THE RESULT IS PASS ***")
    else:
        print("*** THE RESULT IS FAIL ***")

if __name__ == '__main__':
    main(sys.argv[1:])

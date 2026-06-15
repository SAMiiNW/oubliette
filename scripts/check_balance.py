import os, json, urllib.request
from eth_keys import keys

pk = os.environ["GENLAYER_PRIVATE_KEY"].strip().strip('"')
if pk.startswith("0x"):
    pk = pk[2:]
addr = keys.PrivateKey(bytes.fromhex(pk)).public_key.to_checksum_address()
print("address", addr)

payload = json.dumps({
    "jsonrpc": "2.0", "id": 1, "method": "eth_getBalance",
    "params": [addr, "latest"],
}).encode()
req = urllib.request.Request(
    "https://rpc-bradbury.genlayer.com",
    data=payload,
    headers={"Content-Type": "application/json", "User-Agent": "Mozilla/5.0"},
)
res = urllib.request.urlopen(req, timeout=30)
out = json.loads(res.read().decode())
bal = int(out["result"], 16)
print("balance_wei", bal)
print("balance_gen", bal / 10**18)

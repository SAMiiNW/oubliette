import os, json
from genlayer_py import create_client, create_account
from genlayer_py.chains import testnet_bradbury
from genlayer_py.abi import calldata
from genlayer_py.abi.transactions import serialize
from genlayer_py.contracts.utils import make_calldata_object
import eth_utils


def load():
    pk = os.environ["GENLAYER_PRIVATE_KEY"].strip().strip('"')
    account = create_account(account_private_key=pk)
    client = create_client(chain=testnet_bradbury, account=account)
    dep = json.load(open("deployment.json", "r", encoding="utf-8"))
    return account, client, dep["contract_address"]


def read(client, account, addr, fn, args=None):
    data = [
        calldata.encode(make_calldata_object(method=fn, args=args or [], kwargs=None)),
        b"\x00",
    ]
    res = client.provider.make_request(method="gen_call", params=[{
        "type": "read",
        "to": addr,
        "from": account.address,
        "data": serialize(data),
        "transaction_hash_variant": "latest-nonfinal",
    }])["result"]
    hex_data = res["data"] if isinstance(res, dict) else res
    return calldata.decode(eth_utils.hexadecimal.decode_hex("0x" + hex_data))

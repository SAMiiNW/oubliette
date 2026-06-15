import os, json
from genlayer_py import create_client, create_account
from genlayer_py.chains import testnet_bradbury
from genlayer_py.types import TransactionStatus

pk = os.environ["GENLAYER_PRIVATE_KEY"].strip().strip('"')
account = create_account(account_private_key=pk)
print("deployer", account.address)

client = create_client(chain=testnet_bradbury, account=account)

code = open("contracts/contract.py", "r", encoding="utf-8").read()
print("code bytes", len(code.encode("utf-8")))

tx_hash = client.deploy_contract(code=code, args=[])
print("deploy_tx", tx_hash)

receipt = client.wait_for_transaction_receipt(
    transaction_hash=tx_hash,
    status=TransactionStatus.ACCEPTED,
    interval=5000,
    retries=160,
)

tx = client.get_transaction(transaction_hash=tx_hash)
def g(o, k):
    if isinstance(o, dict):
        return o.get(k)
    return getattr(o, k, None)

addr = g(tx, "recipient")
status_name = g(tx, "status_name")
exec_name = g(tx, "tx_execution_result_name")
result_name = g(tx, "result_name")
print("status_name", status_name)
print("exec_result", exec_name)
print("result_name", result_name)
print("contract_address", addr)

with open("deployment.json", "w", encoding="utf-8") as f:
    json.dump({
        "contract_address": addr,
        "deploy_tx": tx_hash,
        "status_name": status_name,
        "exec_result": exec_name,
        "result_name": result_name,
    }, f, indent=2)
print("WROTE deployment.json")

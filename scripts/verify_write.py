import json
from genlayer_py.types import TransactionStatus
from gl import load, read

account, client, addr = load()
print("contract", addr)

# 1. Author a lock (one write).
author_tx = client.write_contract(
    address=addr,
    function_name="author_lock",
    args=[
        "The Tidelocked Vault",
        "This vault door is sealed by a single iron bolt linked to the moon. "
        "It only retracts at the one moment the sea neither rises nor falls. "
        "Name that moment and explain why the bolt is free precisely then.",
        "Solution: slack water at high or low tide, when tidal current velocity "
        "is momentarily zero between flood and ebb. SENTINEL-TIDE-9Q is hidden.",
    ],
    value=0,
)
print("author_tx", author_tx)
client.wait_for_transaction_receipt(
    transaction_hash=author_tx, status=TransactionStatus.ACCEPTED,
    interval=5000, retries=160,
)
atx = client.get_transaction(transaction_hash=author_tx)
print("author exec", atx.get("tx_execution_result_name") if isinstance(atx, dict) else getattr(atx, "tx_execution_result_name", None))

stats = read(client, account, addr, "get_stats")
print("stats after author", stats)
lock_id = "lock-" + str(stats["locks"])
print("target lock", lock_id)

# 2. Submit a winning attempt (second write, the AI ruling).
attempt_tx = client.write_contract(
    address=addr,
    function_name="attempt_lock",
    args=[
        lock_id,
        "The bolt is free at slack water: the brief instant between flood and "
        "ebb when the tidal current velocity drops to zero, so the sea is "
        "neither rising nor falling. With no moving water there is no force on "
        "the moon-linked bolt and it retracts. That moment of zero current is "
        "when I trip the mechanism.",
    ],
    value=0,
)
print("attempt_tx", attempt_tx)
client.wait_for_transaction_receipt(
    transaction_hash=attempt_tx, status=TransactionStatus.ACCEPTED,
    interval=5000, retries=200,
)
ptx = client.get_transaction(transaction_hash=attempt_tx)
print("attempt exec", ptx.get("tx_execution_result_name") if isinstance(ptx, dict) else getattr(ptx, "tx_execution_result_name", None))

stats2 = read(client, account, addr, "get_stats")
print("stats after attempt", stats2)
chron = read(client, account, addr, "get_chronicle", [0])
print("chronicle head", chron[0] if chron else None)
player = read(client, account, addr, "get_player", [account.address])
print("player", player)

with open("write_proof.json", "w", encoding="utf-8") as f:
    json.dump({
        "author_tx": author_tx,
        "attempt_tx": attempt_tx,
        "lock_id": lock_id,
        "stats_after": stats2,
        "chronicle_head": chron[0] if chron else None,
        "player": player,
    }, f, indent=2)
print("WROTE write_proof.json")

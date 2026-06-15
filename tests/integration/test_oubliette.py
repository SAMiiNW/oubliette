from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded


def test_author_and_solve_flow():
    factory = get_contract_factory("Oubliette")
    contract = factory.deploy(args=[])

    # Author a lock with a concrete, solvable mechanism and a hidden rationale.
    tx = contract.author_lock(args=[
        "The Brass Sundial",
        "A brass dial has no numerals, only a gnomon that throws a shadow. "
        "The mechanism opens when you state which single daily moment lets the "
        "shadow vanish entirely. Explain your reasoning.",
        "Solution: at solar noon on the equinox the gnomon shadow is shortest; "
        "but a vanishing shadow needs the sun directly overhead, which only "
        "happens at solar noon when the dial sits on the subsolar latitude. "
        "Accept reasoning that the shadow disappears when the sun is at zenith. "
        "SECRETWORD-XQZ7 is the hidden gatekeeper sentinel.",
    ]).transact()
    assert tx_execution_succeeded(tx)

    stats = contract.get_stats(args=[]).call()
    assert stats["locks"] == 1

    # Submit a winning attempt that defeats the mechanism with sound reasoning.
    tx2 = contract.attempt_lock(args=[
        "lock-1",
        "The shadow vanishes only when the sun is directly overhead at the "
        "gnomon, i.e. at the zenith. That occurs at local solar noon when the "
        "dial lies on the subsolar latitude, so the gnomon casts no shadow at "
        "that instant. I set the mechanism to that moment of zero shadow.",
    ]).transact()
    assert tx_execution_succeeded(tx2)

    stats2 = contract.get_stats(args=[]).call()
    assert stats2["attempts"] == 1
    # The chronicle must have grown by exactly one entry.
    assert stats2["chronicle"] == 1

    chron = contract.get_chronicle(args=[0]).call()
    assert len(chron) == 1
    entry = chron[0]
    assert entry["ruling"] in ("SOLVED", "PARTIAL", "REJECTED")
    # The confidential rationale must never leak into the chronicle entry.
    blob = str(entry).lower()
    assert "secretword-xqz7" not in blob
    # Stored notes must be plain ASCII (no stray glyphs from the model).
    assert entry["note"] == entry["note"].encode("ascii", "ignore").decode("ascii")

    # A public lock view must never expose the rationale field.
    lock_view = contract.get_lock(args=["lock-1"]).call()
    assert "rationale" not in lock_view
    assert "secretword-xqz7" not in str(lock_view).lower()

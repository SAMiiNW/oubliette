import re, sys
src = open("contracts/contract.py", encoding="utf-8").read().rstrip("\n")
readme = open("README.md", encoding="utf-8").read()
blocks = re.findall(r"```python\n(.*?)```", readme, re.S)
embedded = blocks[-1].rstrip("\n")
print("MATCH" if embedded == src else "MISMATCH")
if embedded != src:
    a = src.splitlines()
    b = embedded.splitlines()
    for i in range(max(len(a), len(b))):
        x = a[i] if i < len(a) else "<none>"
        y = b[i] if i < len(b) else "<none>"
        if x != y:
            print("first diff at line", i+1)
            print("src:", repr(x))
            print("emb:", repr(y))
            break

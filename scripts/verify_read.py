from gl import load, read

account, client, addr = load()
print("contract", addr)
stats = read(client, account, addr, "get_stats")
print("get_stats", stats)
locks = read(client, account, addr, "get_locks", [0])
print("get_locks", locks)

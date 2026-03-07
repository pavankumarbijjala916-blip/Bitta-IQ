import psutil
import time

def get_top_cpu_processes(limit=5):
    processes = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
        try:
            # Get CPU usage (interval needed for accuracy, but blocking)
            # For a real agent, we might use a non-blocking approach or one-off
            processes.append(proc.info)
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    # Sort by cpu_percent
    # Note: process_iter might return 0.0 if not monitored over time. 
    # psutil.cpu_percent needs an interval or two calls.
    # Let's try a different approach for the test: 
    # calling cpu_percent() on specific heavy processes?
    # Actually, proc.cpu_percent() defaults to 0.0 immediately.
    return processes

print("Scanning processes...")
# To get accurate CPU, we need to wait.
# Collect initial stats
for proc in psutil.process_iter():
    try:
        proc.cpu_percent()
    except:
        pass

time.sleep(1)

# Collect final stats
procs = []
for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
    try:
        # This second call returns the usage since the last call
        p_info = proc.info
        if p_info['cpu_percent'] > 0:
            procs.append(p_info)
    except:
        pass

# Sort and print
top_procs = sorted(procs, key=lambda p: p['cpu_percent'], reverse=True)[:5]

print("Top 5 Energy Hogs:")
for p in top_procs:
    print(f"{p['name']}: {p['cpu_percent']}%")

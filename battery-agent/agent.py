print("DEBUG: Script starting...")
import psutil
import requests
import time
import socket
from datetime import datetime
import json
import traceback
import sys
import numpy as np
from collections import deque

# Force UTF-8 encoding for stdout/stderr to handle emojis on Windows
try:
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    if sys.stderr.encoding != 'utf-8':
        sys.stderr.reconfigure(encoding='utf-8')
except Exception:
    pass

# Configuration
SERVER_URL = "http://127.0.0.1:5001/api/telemetry"
DEVICE_NAME = socket.gethostname()

# ML Data Buffer (Store last 20 minutes of data for trend analysis)
# Stores tuples of (timestamp_unix, percent)
data_buffer = deque(maxlen=240) # 240 samples @ 5s interval = 20 minutes

def disable_quick_edit():
    """
    Disable QuickEdit Mode in Windows Console to prevent the script from being
    paused when the user clicks inside the terminal window.
    """
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        # Standard Input Handle
        hStdIn = kernel32.GetStdHandle(-10) # STD_INPUT_HANDLE
        mode = ctypes.c_ulong()
        if not kernel32.GetConsoleMode(hStdIn, ctypes.byref(mode)):
            return
        
        # ENABLE_QUICK_EDIT_MODE = 0x0040
        # ENABLE_INSERT_MODE = 0x0020
        # We want to remove these flags
        new_mode = mode.value & ~0x0040 & ~0x0020
        kernel32.SetConsoleMode(hStdIn, new_mode)
        log("✅ Windows QuickEdit Mode disabled (prevents accidental pausing)")
    except Exception as e:
        log(f"⚠️ Could not disable QuickEdit mode: {e}")

def log(msg):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    formatted_msg = f"[{timestamp}] {msg}"
    print(formatted_msg)
    try:
        with open("agent.log", "a", encoding="utf-8") as f:
            f.write(formatted_msg + "\n")
    except Exception:
        pass

def predict_time_remaining(buffer, current_percent):
    """
    Uses Linear Regression to predict seconds remaining until 0%
    """
    if len(buffer) < 12: # Need at least 1 minute of data (12 * 5s)
        return None
    
    # Convert buffer to numpy arrays
    data = np.array(list(buffer))
    X = data[:, 0] # Timestamps
    y = data[:, 1] # Percentages

    # Fit Linear Regression using numpy (degree=1)
    # y = slope * X + intercept
    slope, intercept = np.polyfit(X, y, 1)

    # If slope is positive or zero, we are charging or holding steady
    if slope >= 0:
        return None
    
    # Calculate time to reach 0%
    # 0 = intercept + slope * target_time
    # target_time = -intercept / slope
    
    target_time = -intercept / slope
    
    current_time = time.time()
    seconds_left = target_time - current_time
    
    return max(0, seconds_left)

if __name__ == "__main__":
    disable_quick_edit()
    log(f"🔋 BATT IQ Agent Starting on {DEVICE_NAME}...")
    log(f"🧠 ML Model Initialized (Linear Regression)")
    log(f"📡 Connecting to {SERVER_URL}")
    log("----------------------------------------")

    while True:
        try:
            while True:
                try:
                    # Read Battery
                    try:
                        battery = psutil.sensors_battery()
                    except Exception as e:
                        log(f"❌ Error reading battery: {e}")
                        battery = None

                    if battery:
                        current_time = time.time()
                        
                        # Update ML Buffer
                        # Only add to buffer if discharging to learn the discharge curve
                        if not battery.power_plugged:
                            data_buffer.append((current_time, battery.percent))
                        else:
                            # Clear buffer if charging to avoid mixing curves
                            if len(data_buffer) > 0 and data_buffer[-1][1] < battery.percent:
                                 data_buffer.clear()

                        # Perform Prediction
                        ai_seconds_left = None
                        if not battery.power_plugged:
                            ai_seconds_left = predict_time_remaining(data_buffer, battery.percent)

                        payload = {
                            "percent": battery.percent,
                            "power_plugged": battery.power_plugged,
                            "seconds_left": battery.secsleft,
                            "ai_seconds_left": ai_seconds_left, # New AI field
                            "device": DEVICE_NAME,
                            "timestamp": datetime.now().isoformat()
                        }
                        
                        # Send to Server
                        log_msg = f"Sent: {battery.percent}%"
                        if ai_seconds_left:
                            mins = int(ai_seconds_left / 60)
                            log_msg += f" | 🧠 AI Prediction: {mins} mins left"
                        else:
                            log_msg += f" | ⚡ CHARGING" if battery.power_plugged else " | 📉 Learning..."
                        
                        try:
                            response = requests.post(SERVER_URL, json=payload, timeout=10)
                            
                            if response.status_code == 200:
                                log(log_msg)
                            else:
                                log(f"⚠️ Server Error: {response.status_code}")
                        except requests.exceptions.ConnectionError:
                            log("⚠️ Connection Refused - Backend offline? Retrying in 5s...")
                        except requests.exceptions.Timeout:
                            log("⚠️ Connection Timed Out - Retrying in 5s...")
                    else:
                        log("❌ No battery detected by psutil!")

                except Exception as e:
                    log(f"❌ Unexpected Error in inner loop: {e}")
                    log(traceback.format_exc())

                # Pulse every 5 seconds
                time.sleep(5)
        except Exception as outer_e:
            log(f"💥 CRITICAL FATAL ERROR (Will auto restart string in 10s): {outer_e}")
            log(traceback.format_exc())
            time.sleep(10)

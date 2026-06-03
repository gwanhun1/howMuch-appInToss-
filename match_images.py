import os
local_dir = "/Users/jeong-gwanhun/Desktop/study/howMuch-appInToss-/public/screenshot"
local_files = sorted([f for f in os.listdir(local_dir) if f != ".DS_Store"])
for i, f in enumerate(local_files):
    print(f"{i+1}: {f}")

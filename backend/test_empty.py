import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from grading_engine import sanitize_config

solution = """
interface Ethernet0/0.10
 encapsulation dot1Q 10
 ip address 192.168.10.1 255.255.255.0
"""
empty_run = """
Building configuration...
Current configuration : 1000 bytes
!
version 15.4
!
end
"""

exp = sanitize_config(solution)
act = sanitize_config(empty_run)
missing = exp - act
print("Expected size:", len(exp))
print("Actual size:", len(act))
print("Missing lines:", missing)
print("Passed:", len(missing) == 0)

import sys
import os
import time
from netmiko import ConnectHandler

# Make sure we can import grading_engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from grading_engine import grade_lab

r1_device = {
    "device_type": "cisco_ios_telnet",
    "host": "100.120.167.31",
    "port": 5000,
    "username": "",
    "password": "",
    "secret": "",
    "global_delay_factor": 2,
    "timeout": 30,
}

sw1_device = {
    "device_type": "cisco_ios_telnet",
    "host": "100.120.167.31",
    "port": 5001,
    "username": "",
    "password": "",
    "secret": "",
    "global_delay_factor": 2,
    "timeout": 30,
}

r1_config = [
    "interface Ethernet0/0",
    "no shutdown",
    "interface Ethernet0/0.10",
    "encapsulation dot1Q 10",
    "ip address 192.168.10.1 255.255.255.0",
    "interface Ethernet0/0.20",
    "encapsulation dot1Q 20",
    "ip address 192.168.20.1 255.255.255.0",
    "ip dhcp pool VLAN10",
    "network 192.168.10.0 255.255.255.0",
    "default-router 192.168.10.1",
    "ip dhcp pool VLAN20",
    "network 192.168.20.0 255.255.255.0",
    "default-router 192.168.20.1",
]

sw1_config = [
    "vlan 10",
    "name VLAN10",
    "vlan 20",
    "name VLAN20",
    "interface Ethernet0/0",
    "switchport trunk encapsulation dot1q",
    "switchport mode trunk",
    "interface Ethernet0/1",
    "switchport access vlan 10",
    "switchport mode access",
    "interface Ethernet0/2",
    "switchport access vlan 20",
    "switchport mode access",
]

def main():
    try:
        # Connect to SW1
        print("Connecting to SW1...")
        sw1 = ConnectHandler(**sw1_device)
        sw1.send_config_set(sw1_config)
        
        sw1.write_channel("\r\nend\r\n")
        time.sleep(1)
        sw1.set_base_prompt()
        if not sw1.check_enable_mode():
            sw1.enable()
            
        sw1.send_command("terminal length 0")
        output = sw1.send_command("show run")
        
        if "vlan 10" in output.lower():
            print("SW1: 'vlan 10' DOES appear in the running config!")
        else:
            print("SW1: 'vlan 10' DOES NOT appear in the running config.")
            
        sw1.disconnect()

        # Connect to R1
        print("Connecting to R1...")
        r1 = ConnectHandler(**r1_device)
        r1.send_config_set(r1_config)
        r1.disconnect()
        
        print("Configuration applied successfully. Now running grading engine...")
        
        # Run Grading Engine
        lab_yaml = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "labs", "inter-vlan-routing", "lab.yaml"))
        result = grade_lab(lab_yaml)
        
        print(f"\n--- GRADING RESULT ---")
        print(f"Passed: {result['passed']}")
        print(f"Percentage: {result['percentage']}%")
        
        for nr in result.get("node_results", []):
            print(f"Node {nr.get('node')}: passed={nr.get('passed')}")
            if not nr.get('passed'):
                print(f"  Missing: {nr.get('missing_lines')}")
                print(f"  Error: {nr.get('error')}")

    except Exception as e:
        print(f"Error during execution: {e}")

if __name__ == "__main__":
    main()

import sys
from netmiko import ConnectHandler

device = {
    "device_type": "cisco_ios_telnet",
    "host": "100.120.167.31",
    "port": 5001,
    "username": "",
    "password": "",
    "secret": "",
    "global_delay_factor": 2,
    "timeout": 30,
}

try:
    conn = ConnectHandler(**device)
    print("Connected to SW1")
    
    # ensure enable mode
    if not conn.check_enable_mode():
        conn.enable()
        
    # configure vlan 99
    conn.send_config_set(["vlan 99"])
    
    # drop to exec
    conn.write_channel("\r\nend\r\n")
    import time
    time.sleep(1)
    conn.set_base_prompt()
    
    # show run
    conn.send_command("terminal length 0")
    output = conn.send_command("show run")
    
    if "vlan 99" in output.lower():
        print("YES! 'vlan 99' is explicitly shown in the running config.")
    else:
        print("NO. 'vlan 99' does NOT appear in the running config (likely saved in vlan.dat).")
        
    # cleanup
    conn.send_config_set(["no vlan 99"])
    conn.disconnect()
except Exception as e:
    print(f"Failed to connect or test: {e}")

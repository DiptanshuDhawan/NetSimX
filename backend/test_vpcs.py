import sys
from netmiko import ConnectHandler

def test_vpcs(host, port):
    device = {
        "device_type": "cisco_ios_telnet", # try cisco_ios_telnet since it expects >
        "host": host,
        "port": port,
        "username": "",
        "password": "",
        "secret": "",
        "global_delay_factor": 2,
        "timeout": 15,
        "session_log": "netmiko_vpcs.log"
    }
    
    try:
        print(f"Connecting to {host}:{port}...")
        net_connect = ConnectHandler(**device)
        print("Connected!")
        output = net_connect.send_command("ping 127.0.0.1")
        print("Output:", output)
        net_connect.disconnect()
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    test_vpcs("100.120.167.31", 5002) # PC1 console port from lab.yaml

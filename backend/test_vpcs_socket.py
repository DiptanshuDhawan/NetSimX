import socket
import time

def test_vpcs_socket(host, port):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(5)
        s.connect((host, port))
        
        # Wake up prompt
        s.sendall(b"\r\n")
        time.sleep(0.5)
        out = s.recv(1024).decode("utf-8", errors="ignore")
        print("Prompt:", out)
        
        # Send ping
        cmd = "ping 192.168.20.2\r\n"
        s.sendall(cmd.encode("utf-8"))
        
        # Read output for up to 5 seconds
        end_time = time.time() + 5
        output = ""
        while time.time() < end_time:
            try:
                data = s.recv(1024).decode("utf-8", errors="ignore")
                output += data
                if "bytes from" in output.lower():
                    print("Ping success!")
                    break
                if "not reachable" in output.lower() or "timeout" in output.lower():
                    print("Ping failed!")
                    break
            except socket.timeout:
                break
        
        print("Final Output:", output)
        s.close()
    except Exception as e:
        print("Failed:", e)

if __name__ == "__main__":
    test_vpcs_socket("100.120.167.31", 5002) # PC1 console port from lab.yaml

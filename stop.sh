# Get PID of Aegis process
PID=$(sudo lsof -P -i | grep aegis | grep LISTEN | awk '{ print $2 }')
# display command to execute
echo "sudo kill $PID"
# kill process gracefully (sigterm)
sudo kill $PID
# display status
~/aegis-host/status.sh

# webpack l

PID=$(ps -ef | grep webpack | awk '{ print $2 }')
# display command to execute
echo "sudo kill $PID"
# kill process gracefully (sigterm)
sudo kill $PID

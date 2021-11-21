echo "servers running"
sudo lsof -P -i tcp | grep LISTEN

export PID=$(sudo lsof -P -i tcp:80,443 | grep aegis | grep LISTEN | awk '{ print $2 }')

echo "sudo kill $PID"

sudo kill $PID

echo "servers running"

sudo lsof -P -i tcp | grep LISTEN

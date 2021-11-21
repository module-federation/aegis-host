# print current entries that match
sudo lsof -P -i tcp | grep LISTEN | grep aegis

# get process id of aegis
PID=$(sudo lsof -P -i tcp | grep LISTEN | grep aegis | awk '{print $2}')

# get number of characters in PID
NUM=$(echo $PID | wc -c)

# the num of chars if PID is
# not found = 1, otherwise > 1

if [ ${NUM} -gt 1 ]; then
  echo "server is up"
else
  echo "server is down"
fi

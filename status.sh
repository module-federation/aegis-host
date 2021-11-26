# lookup the domain's ip and compare to external ip for this host
# list the aegis host process/es and listener sockets;
# otherwise, display a message that the server is down.

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN1=aegis.module-federation.org
DOMAIN2=aegis2.module-federation.org

IP_AWS=$(curl checkip.amazonaws.com)
IP_DNS1=$(nslookup -recurse $DOMAIN1 | grep Address | grep -v "#" | awk '{print $2}')
IP_DNS2=$(nslookup -recurse $DOMAIN2 | grep Address | grep -v "#" | awk '{print $2}')

echo "external address ${IP_AWS}"

if [ "${IP_AWS}" == "${IP_DNS1}" ]; then
  echo -e "domain${GREEN} $DOMAIN1 $NC"
fi

if [ "$IP_AWS" == "$IP_DNS2" ]; then
  echo -e "domain${GREEN} $DOMAIN2 $NC"
fi

# print current entries that match
sudo lsof -P -i tcp | grep LISTEN | grep aegis

# get process id of aegis
PID=$(sudo lsof -P -i tcp | grep LISTEN | grep aegis | awk '{print $2}')

# get number of characters in PID
NUM=$(echo $PID | wc -c)

# the num of chars if PID is
# not found = 1, otherwise > 1

if [ ${NUM} -gt 1 ]; then
  echo -e "${GREEN}server is up $NC"
else
  echo -e "${RED}server is down $NC"
fi

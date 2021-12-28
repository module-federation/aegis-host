# lookup the domain's ip and compare to external ip for this host
# list the aegis host process/es and listener sockets;
# otherwise, display a message that the server is down.

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

DOMAIN1=aegis.module-federation.org
DOMAIN2=aegis2.module-federation.org

# Get public IP of this host
IPADDR_PUBLIC=$(curl -s checkip.amazonaws.com)
# Get IP of domain1
IPADDR_DOMAIN1=$(nslookup -recurse $DOMAIN1 | grep Address | grep -v "#" | awk '{print $2}')
# Get IP of domain2
IPADDR_DOMAIN2=$(nslookup -recurse $DOMAIN2 | grep Address | grep -v "#" | awk '{print $2}')

# print the public IP and fully qualified domain name of this host

echo "public address $IPADDR_PUBLIC"

if [ "$IPADDR_PUBLIC" == "$IPADDR_DOMAIN1" ]; then
  echo -e "domain${GREEN} $DOMAIN1 $NC"
fi

if [ "$IPADDR_PUBLIC" == "$IPADDR_DOMAIN2" ]; then
  echo -e "domain${GREEN} $DOMAIN2 $NC"
fi

# print current running process
SUDO=sudo
$SUDO lsof -P -i | grep LISTEN | grep aegis

# get process ID of aegis
PID=$($SUDO lsof -P -i | grep LISTEN | grep aegis | awk '{print $2}')

if [[ ${PID} ]]; then
  echo -e "${GREEN}server is up $NC"
else
  echo -e "${RED}server is down $NC"
fi

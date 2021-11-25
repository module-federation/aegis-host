# lookup the domain's ip and compare to external ip for this host
# list the aegis host process/es and listener sockets;
# otherwise, display a message that the server is down.

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

domain1=aegis.module-federation.org
domain2=aegis2.module-federation.org

external_ip_aws=$(curl checkip.amazonaws.com)
external_ip_dns1=$(nslookup -recurse $domain1 | grep Address | grep -v "#" | awk '{print $2}')
external_ip_dns2=$(nslookup -recurse $domain2 | grep Address | grep -v "#" | awk '{print $2}')

echo "AWS external address $external_ip_aws"

if [ "$external_ip_aws" == "$external_ip_dns1" ]; then
  echo -e "${GREEN}this is $domain1 $NC"
fi

if [ "$external_ip_aws" == "$external_ip_dns2" ]; then
  echo -e "${GREEN}this is $domain2 $NC"
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

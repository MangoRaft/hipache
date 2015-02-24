from   dockerfile/nodejs

# Update
run apt-get -y update

# Install supervisor, node, npm and redis
run apt-get -y install supervisor

# Manually add hipache folder
run mkdir /hipache
add . /hipache

# Then install it
run npm install -g /hipache --production

# This is provisional, as we don't honor it yet in hipache
env NODE_ENV production

# Add supervisor conf
add ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

expose  80

# Start supervisor
cmd ["supervisord", "-n"]

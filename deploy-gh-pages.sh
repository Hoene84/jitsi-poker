#!/bin/bash

while read line; do
  FROM=$(echo $line | cut -d' ' -f1)
  TO=$(echo $line | rev | cut -d' ' -f1 | rev)
  TO_SUB_DIR=${TO#'/usr/share/jitsi-meet/'}

  mkdir -p build_gh_pages/$TO_SUB_DIR
  cp -r $FROM build_gh_pages/$TO_SUB_DIR
done <debian/jitsi-meet-web.install

cp config-alpha.js build_gh_pages/config.js
cp index.html build_gh_pages/404.html


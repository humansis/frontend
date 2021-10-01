#!/bin/bash

COMMIT=$CI_COMMIT_SHORT_SHA
COMMIT_AUTHOR=$CI_COMMIT_AUTHOR
TAG=`git describe --tags`
BRANCH=$CI_COMMIT_REF_NAME

if [[ $CI_COMMIT_TAG =~ ^v.*$ ]]; then
  TAG=$CI_COMMIT_TAG
  BRANCH="master"
fi

if [[ $BRANCH == "master" ]]; then
    APPVERSION=$TAG
elif [[ $BRANCH =~ ^release\/.*$ ]]; then
    VERSION=`echo $BRANCH | sed -e 's/release\///g'`
    APPVERSION=$VERSION-$COMMIT
else
    APPVERSION=$COMMIT
fi

sed -i -e "s|__COMMIT_HASH__|$COMMIT|g" src/gitInfo.js
sed -i -e "s|__APP_VERSION__|$APPVERSION|g" src/gitInfo.js
sed -i -e "s|__TAG__|$TAG|g" src/gitInfo.js
sed -i -e "s|__BRANCH__|$BRANCH|g" src/gitInfo.js

cat src/gitInfo.js

sed -i -e "s|__COMMIT_HASH__|$COMMIT|g" public/version.json
sed -i -e "s|__COMMIT_AUTHOR__|$COMMIT_AUTHOR|g" public/version.json
sed -i -e "s|__APP_VERSION__|$APPVERSION|g" public/version.json
sed -i -e "s|__TAG__|$TAG|g" public/version.json
sed -i -e "s|__BRANCH__|$BRANCH|g" public/version.json

cat public/version.json
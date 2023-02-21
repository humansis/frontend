#!/bin/bash

# first parameter: environment to deploy to [prod, test, dev, stage and demo]

#immediately exits if a command exits with an non-zero status
set -e

# build the project (contents will be in directory dist/bms-front)
echo "Build starting"
if [[ $1 == "production" ]]; then
    mv .env.prod .env
elif [[ $1 == "test" ]]; then
    mv .env.testing .env
elif [[ $1 == "dev1" ]]; then
    mv .env.development .env
elif [[ $1 == "dev2" ]]; then
    mv .env.development2 .env
elif [[ $1 == "dev3" ]]; then
    mv .env.development3 .env
elif [[ $1 == "stage" ]]; then
    mv .env.stage .env
elif [[ $1 == "stage2" ]]; then
    mv .env.stage2 .env
elif [[ $1 == "demo" ]]; then
    mv .env.demo .env
else
    echo "Unknown environment"
    exit 1
fi

cat .env
yarn build

echo "Build complete"

# gzip up all files so that they are smaller
echo "Compression starting"
rm -Rf ./dist_gzipped/
mkdir -p dist_gzipped/
cp -R dist/* dist_gzipped/
gzip -9fr dist_gzipped/
# remove .gz suffix
FILES=`find dist_gzipped`
for FILE in $FILES; do
    NEW_FILE=${FILE/.gz/}
    echo $NEW_FILE
    if [ "${FILE}" != "${NEW_FILE}" ]; then
        mv ${FILE} ${NEW_FILE}
    fi;
done;
echo "Compression complete"

# deploy on aws
echo "Upload starting"

if [[ $1 == "production" ]]; then
    aws s3 rm s3://prod-pin.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://prod-pin.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E2Y6W09FNZ68XW --paths '/*'
elif [[ $1 == "test" ]]; then
    aws s3 rm s3://test-pin.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://test-pin.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E3RKOVT9Z18TQC --paths '/*'
elif [[ $1 == "dev1" ]]; then
    aws s3 rm s3://dev-pin.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://dev-pin.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id EBG5G8O7ZSVBV --paths '/*'
elif [[ $1 == "dev2" ]]; then
    aws s3 rm s3://dev2.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://dev2.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E1L04TE4FQK24O --paths '/*'
elif [[ $1 == "dev3" ]]; then
    aws s3 rm s3://dev3.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://dev3.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E2RDLDL7FXC18J --paths '/*'
elif [[ $1 == "stage" ]]; then
    aws s3 rm s3://stage-pin.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://stage-pin.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E3T4ZDIOJ7A023 --paths '/*'
elif [[ $1 == "stage2" ]]; then
    aws s3 rm s3://stage2.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://stage2.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E2N81PJNA8E0EC --paths '/*'
elif [[ $1 == "demo" ]]; then
    aws s3 rm s3://demo.humansis.org --recursive
    aws s3 cp ./dist_gzipped s3://demo.humansis.org --recursive --acl public-read --content-encoding gzip
    aws cloudfront create-invalidation --distribution-id E3MTL7N9452SZ4 --paths '/*'
fi
echo "Upload complete"

#!/bin/bash

set -e
set -o pipefail

echo Starting build...

if [ -z "$1" ]
  then
    env="dev"
  else
    if [ $1 == "dev" ] || [ $1 == "prod" ]
      then
        env=$1
      else
        echo Invalid env arguement $1
        exit 1
    fi
fi

echo Building for $env environment

echo Checking build dependencies...
# TODO(Fede): check for typescript version and give an error
# if it is incorrect.
if command -v tsc >/dev/null 2>&1; then
  echo Typescript is already installed.
else
  echo Did not find Typescript
  echo Installing...
  npm install -g typescript
fi

# Reset the build directory
rm -rf build
mkdir -p build

# Get html file
echo Copying .html files...
cp src/index.html build/index.html
echo .html Files copied successfully

# Get js file
echo Compiling .ts files...
envFile="src/config/${env}.ts"
tsc $envFile src/types.ts src/shaders.ts src/index.ts --outFile build/index.js --lib dom,es2015
echo .ts Files compiled successfully

# Copy images
echo Copying .png files...
cp src/assets/*.png build/
echo .png Files copied successfully

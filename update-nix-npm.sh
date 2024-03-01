#!/usr/bin/env bash

# Generates a version 2 lockfile
npm i --lockfile-version 2 --package-lock-only

LD_LIBRARY_PATH="" nix run github:svanderburg/node2nix -- \
  --development \
  --input package.json \
  --lock package-lock.json \
  --node-env ./nix/node-env.nix \
  --composition ./nix/default.nix \
  --output ./nix/node-package.nix

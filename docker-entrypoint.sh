#!/bin/sh
set -eu

delibot-api &
exec node server.js

#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

for FILE in "$SCRIPT_DIR"/*.txt
do
  python3 "$SCRIPT_DIR"/pack_composers.py "$FILE" > "$FILE.ts"
done

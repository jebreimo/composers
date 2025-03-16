#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

echo "Copying composers.txt from ComposerDB"
cp -f /Users/janeb/Repositories/Misc/ComposerDB/composers.txt "$SCRIPT_DIR/all_composers.txt"

for FILE in "$SCRIPT_DIR"/*.txt
do
  python3 "$SCRIPT_DIR"/pack_composers.py "$FILE" > "$FILE.ts"
done

echo "Copying all_composers.txt.ts to src"
cp "$SCRIPT_DIR/all_composers.txt.ts" "$SCRIPT_DIR/../../src/all_composers.txt.ts"

# -*- coding: UTF-8 -*-
# ===========================================================================
# Copyright © 2024 Jan Erik Breimo. All rights reserved.
# Created by Jan Erik Breimo on 2024-07-11.
#
# This file is distributed under the BSD License.
# License text is included with the source distribution.
# ===========================================================================
import base64
import gzip
import os
import sys
import templateprocessor


"""
This script takes in a list of composers, removes lines that
are there for the human reader, but irrelevant for a computer program,
compresses it with gzip, encodes the result with BASE64, then wraps it
inside a basic TypeScript file which it writes to stdout.
"""


TEMPLATE = """\
export const packedComposers = "\\
@{composers}";
"""


class Composers:
    def __init__(self, obj):
        self._obj = obj

    def composers(self, _params, _context):
        data = base64.b64encode(gzip.compress(self._obj.encode("utf-8")))
        lines = []
        for i in range(0, len(data), 72):
            lines.append(data[i:i + 72].decode("ascii"))
        return "\\\n".join(lines), templateprocessor.PasteMethod.RAW


def pack_composers(file_name):
    lines = []
    with open(file_name, "r", encoding="utf-8") as file:
        for i, line in enumerate(file):
            line = line.strip()
            if not line:
                continue
            n = line.count(";")
            if n == 5:
                lines.append(";".join(p.strip() for p in line.split(";")))
            elif n:
                print(f"Ignoring line {i}: {line}")
                continue
    text = "\n".join(lines)
    expander = templateprocessor.ObjectExpander(Composers(text))
    print(templateprocessor.make_text(TEMPLATE, expander))
    # with open("packed_composers.js", "w", encoding="utf-8") as file:
    #     file.write(templateprocessor.make_text(TEMPLATE, expander))


def main():
    if len(sys.argv) != 2:
        print(f"usage: {os.path.basename(sys.argv[0])} <file>")
        return 1
    pack_composers(sys.argv[1])
    return 0


sys.exit(main())

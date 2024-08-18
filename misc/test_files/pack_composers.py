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
import json
import os
import sys
import templateprocessor
import unicodedata


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


def split_name(name: str):
    quote = name.find('"')
    if quote == -1:
        return name.split()

    end_quote = name.find('"', quote + 1)
    if end_quote == -1:
        raise ValueError(f"Unmatched quote in {name}.")
    names = name[:quote].split()
    names.append(name[quote+1:end_quote])
    names.extend(name[end_quote+1:].split())
    return names


def get_unicode_base_str(s: str):
    return "".join(unicodedata.normalize("NFD", c)[0] for c in s)


def get_unique_names(name: str):
    names = split_name(name)
    for i in range(len(names)):
        name = names[i]
        base_name = get_unicode_base_str(name)
        if base_name != name:
            names.append(base_name)
    if len(names) == 1:
        return None
    return names


class Composer:
    def __init__(self):
        self.surname = None
        self.given_name = None
        self.country = None
        self.birth_year = None
        self.death_year = None
        self.note = None

    def __str__(self):
        return "%s; %s; %s; %s; %s; %s" % (self.surname, self.given_name,
                                           self.country, self.birth_year,
                                           self.death_year, self.note)

    def to_dict(self):
        result = {}
        if self.surname:
            result["surname"] = self.surname
            if names := get_unique_names(self.surname):
                result["surnames"] = names
        if self.given_name:
            result["givenName"] = self.given_name
            if names := get_unique_names(self.given_name):
                result["givenNames"] = names
        result["country"] = [c.strip() for c in self.country.split(",")]
        result["birth"] = self.birth_year
        result["death"] = self.death_year
        if self.note:
            result["note"] = self.note
        return result


def parse_file(file_name):
    composers = []
    for lineno, line in enumerate(open(file_name)):
        parts = [s.strip() for s in line.split(";")]
        if len(parts) == 6:
            comp = Composer()
            comp.surname = parts[0]
            comp.given_name = parts[1]
            comp.country = parts[2]
            comp.birth_year = parts[3]
            comp.death_year = parts[4]
            comp.note = parts[5]
            composers.append(comp)
        elif len(parts) != 1:
            lineno += 1
            print(f"Incorrect number of semicolons on line {lineno}:\n{line}",
                  file=sys.stderr)
    return composers


def main():
    if len(sys.argv) != 2:
        print(f"usage: {os.path.basename(sys.argv[0])} <file>")
        return 1
    composers = parse_file(sys.argv[1])
    text = json.dumps([c.to_dict() for c in composers], ensure_ascii=False,
                      separators=(",", ":"))
    expander = templateprocessor.ObjectExpander(Composers(text))
    print(templateprocessor.make_text(TEMPLATE, expander))
    return 0


sys.exit(main())

# -*- coding: UTF-8 -*-
# ===========================================================================
# Copyright © 2018 Jan Erik Breimo. All rights reserved.
# Created by Jan Erik Breimo on 2018-06-21.
#
# This file is distributed under the BSD License.
# License text is included with the source distribution.
# ===========================================================================
from enum import Enum
from sys import stdout


class TokenType(Enum):
    TEXT = 0
    NEWLINE = 1
    EXPAND = 2
    IF = 3
    ELIF = 4
    ELSE = 5
    ENDIF = 6
    SET = 7


class PasteMethod(Enum):
    ALIGNED = 0
    INDENTED = 1
    RAW = 3


class ScopeState(Enum):
    ACTIVE = 0
    INACTIVE = 1
    DONE = 2


class Error(Exception):
    pass


def _split_key(text):
    b = text.find("(")
    if b == -1:
        return text, ()
    e = text.find(")", b + 1)
    if e == -1:
        raise Error("No closing parenthesis: " + text)
    return text[:b], [s.strip() for s in text[b + 1:e].split(",")]


def _find_next_tag(string, start_index, tag):
    index = string.find(tag, start_index)
    if index == -1:
        return False, len(string)

    if string.startswith(tag, index + len(tag)):
        return True, index

    return False, index


def _tokenize(tmpl_str, start_tag, end_tag):
    for line in tmpl_str.splitlines():
        start = 0
        while True:
            escaped, end = _find_next_tag(line, start, start_tag)
            if escaped:
                end += len(start_tag)
                yield TokenType.TEXT, line[start:end]
                start = end + len(start_tag)
                continue

            if start != end:
                yield TokenType.TEXT, line[start:end]

            if end == len(line):
                yield TokenType.NEWLINE, ""
                break

            start = end + len(start_tag)
            end = line.find(end_tag, start)
            if end == -1:
                raise Error(f"{start_tag} without {end_tag} on the same line.")

            token = line[start:end].strip()
            if token.startswith("IF "):
                yield TokenType.IF, token[3:].lstrip()
            elif token.startswith("ELIF "):
                yield TokenType.ELIF, token[5:].lstrip()
            elif token == "ELSE":
                yield TokenType.ELSE, ""
            elif token == "ENDIF":
                yield TokenType.ENDIF, ""
            elif token.startswith("SET "):
                yield TokenType.SET, token[4:].lstrip()
            else:
                yield TokenType.EXPAND, token
            start = end + len(end_tag)


class Expander:
    def __init__(self, context=("", 0)):
        self.context = context

    def __call__(self, key, params, context):
        if callable(self.__getattribute__(key)):
            context = (self.context[0] + context[0],
                       self.context[1] + context[1])
            return self.__getattribute__(key)(params, context)
        else:
            return self.__getattribute__(key)

    def assign_value_(self, identifier, value):
        self.__setattr__(identifier, value)


class DictExpander(Expander):
    def __init__(self, dictionary):
        super().__init__()
        self._dict = dictionary

    def __call__(self, key, params, context):
        return self._dict[key]

    def assign_value_(self, identifier, value):
        self._dict[identifier] = value


class FuncExpander(Expander):
    def __init__(self, expand_func, assign_func=None):
        super().__init__()
        self._expand = expand_func
        self._assign = assign_func

    def __call__(self, key, params, context):
        return self._expand(key, params, context)

    def assign_value_(self, identifier, value):
        if self._assign:
            self._assign(identifier, value)


class ObjectExpander(Expander):
    def __init__(self, obj):
        super().__init__()
        self._obj = obj

    def __call__(self, key, params, context):
        attribute = self._obj.__getattribute__(key)
        if callable(attribute):
            context = (self.context[0] + context[0],
                       self.context[1] + context[1])
            return attribute(params, context)
        else:
            return attribute

    def assign_value_(self, identifier, value):
        self._obj.__setattr__(identifier, value)


def is_empty_or_space(s):
    return not s or s.isspace()


class TemplateProcessor:
    def __init__(self, template, expander, start_tag="@{", end_tag="}"):
        self.template = template
        self.expander = expander
        self.lines = []
        self.cur_line = []
        self.column = 0
        self.scope = [ScopeState.ACTIVE]
        self.line_no = 1
        self.alignments = []
        self.tags = (start_tag, end_tag)

    def __call__(self):
        ignore_newline = False
        try:
            for token_type, token in _tokenize(self.template, *self.tags):
                if ignore_newline:
                    ignore_newline = False
                    if token_type == TokenType.NEWLINE:
                        if is_empty_or_space("".join(self.cur_line)):
                            self.cur_line = []
                        self.line_no += 1
                        continue
                if token_type == TokenType.NEWLINE:
                    self.handle_newline()
                elif token_type == TokenType.IF:
                    self.handle_if(token)
                    ignore_newline = is_empty_or_space("".join(self.cur_line))
                elif token_type == TokenType.ENDIF:
                    self.handle_endif()
                    ignore_newline = is_empty_or_space("".join(self.cur_line))
                elif self.scope[-1] == ScopeState.DONE:
                    pass
                elif token_type == TokenType.ELIF:
                    self.handle_elif(token)
                    ignore_newline = is_empty_or_space("".join(self.cur_line))
                elif token_type == TokenType.ELSE:
                    self.handle_else()
                    ignore_newline = is_empty_or_space("".join(self.cur_line))
                elif self.scope[-1] == ScopeState.INACTIVE:
                    pass
                elif token_type == TokenType.TEXT:
                    self._add_raw_text(token)
                elif token_type == TokenType.EXPAND:
                    ignore_newline = (not self.handle_expand(token) and
                                      is_empty_or_space("".join(self.cur_line)))
                elif token_type == TokenType.SET:
                    self.handle_set(token)
                    ignore_newline = is_empty_or_space("".join(self.cur_line))
                else:
                    raise Error("Unknown token: " + token_type)
            if len(self.scope) != 1:
                raise Error("Number of IFs without closing ENDIFs: %d" %
                            (len(self.scope) - 1))
        except Error as ex:
            raise Error("[line %d]: %s" % (self.line_no, str(ex)))

    def handle_newline(self):
        self.line_no += 1
        if self.scope[-1] != ScopeState.ACTIVE:
            return
        self.lines.append("".join(self.cur_line).rstrip())
        self.cur_line = []
        self.column = 0

    def handle_expand(self, key):
        if self.scope[-1] != ScopeState.ACTIVE:
            return False

        text = self._expand(key)
        if type(text) is tuple:
            text, paste_method = text
        else:
            paste_method = PasteMethod.ALIGNED

        if text is None:
            return False
        elif type(text) == str:
            if not text:
                return False
            self._add_text(text, paste_method)
        elif type(text) == list:
            if not text:
                return False
            self._add_lines(text, paste_method)
        else:
            self._add_text(str(text), paste_method)
        return True

    def handle_if(self, key):
        if self.scope[-1] != ScopeState.ACTIVE:
            self.scope.append(ScopeState.DONE)
        elif self._expand(key):
            self.scope.append(ScopeState.ACTIVE)
        else:
            self.scope.append(ScopeState.INACTIVE)

    def handle_endif(self):
        if len(self.scope) == 1:
            raise Error("ENDIF must be preceded by IF")
        self.scope.pop()

    def handle_elif(self, key):
        if len(self.scope) == 1:
            raise Error("ELIF must be preceded by IF")
        elif self.scope[-1] == ScopeState.ACTIVE:
            self.scope[-1] = ScopeState.DONE
        elif self.scope[-1] == ScopeState.INACTIVE and self._expand(key):
            self.scope[-1] = ScopeState.ACTIVE

    def handle_else(self):
        if len(self.scope) == 1:
            raise Error("ELSE must be preceded by IF")
        elif self.scope[-1] == ScopeState.ACTIVE:
            self.scope[-1] = ScopeState.DONE
        elif self.scope[-1] == ScopeState.INACTIVE:
            self.scope[-1] = ScopeState.ACTIVE

    def handle_set(self, text):
        parts = text.split("=", 1)
        if len(parts) == 1 or not parts[0]:
            raise Error(f'"SET {text}": invalid format for SET. '
                        'Correct format is "SET identifier=value".')
        self.expander.assign_value_(parts[0], parts[1])

    def _add_lines(self, lines: [str], paste_method: PasteMethod):
        if not lines:
            return
        align = self._get_alignment(paste_method)
        self.cur_line.append(lines[0])
        if len(lines) > 1:
            self.lines.append("".join(self.cur_line))
            self.cur_line = []
            self.column = 0
            for line in lines[1:-1]:
                if line:
                    self.lines.append(align + line)
                else:
                    self.lines.append("")
            self._add_raw_text(align + lines[-1])

    def _add_text(self, text: str, paste_method: PasteMethod):
        if paste_method == PasteMethod.RAW:
            self._add_raw_text(text)
        else:
            lines = text.splitlines()
            if text[-1] == "\n":
                lines.append("")
            self._add_lines(lines, paste_method)

    def _add_raw_text(self, text: str):
        nl_pos = text.rfind("\n")
        if nl_pos == -1:
            self.cur_line.append(text)
            self.column += len(text)
        else:
            self.cur_line.append(text[:nl_pos])
            self.lines.append("".join(self.cur_line))
            self.cur_line = [text[nl_pos + 1:]]
            self.column = len(text) - nl_pos + 1

    def _expand(self, key):
        key, params = _split_key(key)
        return self.expander(key, params,
                             (self._get_indentation(), self.column))

    def _get_indentation(self):
        for i, s in enumerate(self.cur_line):
            for j, c in enumerate(s):
                if c not in "\t ":
                    return "".join(self.cur_line[:i] + [self.cur_line[i][:j]])
        return "".join(self.cur_line)

    def _get_alignment(self, paste_method: PasteMethod):
        if paste_method == PasteMethod.RAW:
            return ""
        ind = self._get_indentation()
        if paste_method == PasteMethod.INDENTED:
            return ind
        else:
            return ind + " " * (self.column - len(ind))


def make_lines(template, expander_func):
    proc = TemplateProcessor(template, expander_func)
    proc()
    return proc.lines


def make_text(template, expander_func):
    return "\n".join(make_lines(template, expander_func))

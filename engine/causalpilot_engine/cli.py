"""JSON CLI for the deterministic CausalPilot engine.

Usage:
    python -m causalpilot_engine.cli analyze   # one JSON object on stdin
    python -m causalpilot_engine.cli jsonl     # one JSON object per stdin line

Only structured JSON is written to stdout. Project attribution: LAI ZEYU (来泽宇).
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any, Dict

from . import __version__
from .analysis import analyze_request, error_result


def _read_stdin_utf8() -> str:
    """Decode the JSON protocol independently of the host console code page."""

    buffer = getattr(sys.stdin, "buffer", None)
    if buffer is None:
        return sys.stdin.read()
    return buffer.read().decode("utf-8")


def _decode_request(raw: str, line_number: int = 1) -> Dict[str, Any]:
    if not raw.strip():
        return error_result(
            "EMPTY_REQUEST",
            "Expected a JSON request on stdin (line {0}).".format(line_number),
        )
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        return error_result(
            "INVALID_JSON",
            "Invalid JSON on stdin line {0}: {1}".format(line_number, exc.msg),
        )
    if not isinstance(payload, dict):
        return error_result(
            "INVALID_REQUEST",
            "Request on stdin line {0} must be a JSON object.".format(line_number),
        )
    return analyze_request(payload)


def _emit(result: Dict[str, Any], pretty: bool = False) -> None:
    # JSON Unicode escapes preserve the decoded values while keeping stdout
    # independent of the host console code page (notably Windows cp1252).
    if pretty:
        rendered = json.dumps(
            result, sort_keys=True, indent=2, ensure_ascii=True, allow_nan=False
        )
    else:
        rendered = json.dumps(
            result,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=True,
            allow_nan=False,
        )
    sys.stdout.write(rendered + "\n")
    sys.stdout.flush()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m causalpilot_engine.cli",
        description="Run deterministic offline experiment analysis.",
    )
    parser.add_argument(
        "mode",
        nargs="?",
        default="analyze",
        choices=("analyze", "jsonl"),
        help="analyze one stdin JSON object or process one object per line",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        help="pretty-print one-shot JSON (ignored for jsonl mode)",
    )
    parser.add_argument("--version", action="version", version=__version__)
    return parser


def main(argv: Any = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        raw_input = _read_stdin_utf8()
    except UnicodeDecodeError:
        result = error_result(
            "STDIN_ENCODING_ERROR",
            "The JSON request on stdin must be encoded as UTF-8.",
        )
        _emit(result, pretty=args.pretty)
        return 2

    if args.mode == "jsonl":
        for line_number, raw in enumerate(raw_input.splitlines(), start=1):
            if not raw.strip():
                continue
            _emit(_decode_request(raw, line_number=line_number), pretty=False)
        return 0

    result = _decode_request(raw_input)
    _emit(result, pretty=args.pretty)
    return 2 if result.get("status") == "error" else 0


if __name__ == "__main__":
    raise SystemExit(main())

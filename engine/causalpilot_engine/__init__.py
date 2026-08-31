"""CausalPilot's deterministic offline analysis engine.

Product owner and project attribution: LAI ZEYU (来泽宇).

The package intentionally keeps generative AI out of calculations. Every
estimate, diagnostic, identifier, and narrative field is produced by versioned,
deterministic Python code.
"""

__author__ = "LAI ZEYU (来泽宇)"
__version__ = "0.1.0"

ENGINE_METADATA = {
    "name": "causalpilot-engine",
    "version": __version__,
    "calculation_mode": "deterministic_offline",
    "ai_used_for_calculations": False,
    "project_owner": __author__,
}

from .analysis import analyze_request

__all__ = ["analyze_request"]

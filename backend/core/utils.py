"""
Utility functions for the core app
"""
from slugify import slugify as python_slugify


def slugify_vietnamese(text):

    return python_slugify(text, lowercase=True)

#!/bin/sh
# Git credential helper setup for persistent gh authentication
# This runs on container startup to configure git to use gh for GitHub auth

# Create config symlink if it doesn't exist
if [ ! -L "$HOME/.config/gh" ]; then
    mkdir -p "$HOME/.config"
    ln -sf "$HOME/.openclaw/gh-config" "$HOME/.config/gh"
fi

# Configure git credential helper in jklaw-repo if it exists
if [ -d "$HOME/.openclaw/jklaw-repo/.git" ]; then
    cd "$HOME/.openclaw/jklaw-repo"
    git config credential.helper '!gh auth git-credential'
fi

# Execute the original command
exec "$@"

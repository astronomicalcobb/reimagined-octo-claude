# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **3D First-Person Shooter Browser Game** that aims to blend gameplay elements from UberStrike and Valorant.

## Current State

This is a new project in its initial setup phase. The repository currently contains:
- Basic git configuration
- Project README with concept description
- No source code or build tooling yet

## Future Development Notes

When code is added to this project, this file should be updated to include:
- Build, test, and development server commands
- Technology stack (game engine, rendering library, networking approach)
- Project architecture (client/server structure, game loop, entity system, etc.)
- Asset pipeline and resource management
- Multiplayer/networking architecture if applicable

## Tech Stack
- Three.js
- Rapier
- WebRTC
- Howler.js
- TypeScript
- Vite

## Performance Considerations
- Implement object pooling for bullets/particles
- Use LOD (Level of Detail) for distant objects
- Optimize draw calls by batching similar meshes
- Consider Web Workers for non-rendering game logic
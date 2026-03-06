# 00 Overview

## Purpose
Use this skill to diagnose Supabase RPC or REST query paths before changing frontend code. The goal is to separate database-side causes from client-side causes and avoid patching the wrong layer.

## Trigger
- RPC returns `[]` unexpectedly.
- REST query returns `500`, `403`, or a partial shape.
- Frontend expects data but the backend path appears empty or filtered out.

## Common Causes
- RLS blocks rows or inserts.
- Filters eliminate all rows.
- Joins or mapping logic exclude the expected record.
- Seed data is incomplete or inconsistent.
- Frontend assumption does not match the actual RPC contract.

## Prerequisites
- Supabase project access is available.
- Relevant env values or MCP access are configured.
- You know which route, hook, or runtime path is failing.

# Floom CLI — Quick reference

> Full guide: [README.md](README.md) · npm: [floom-cli](https://www.npmjs.com/package/floom-cli)

## Install

```bash
npm install -g floom-cli
# or
npx floom-cli <command>
```

## Cheat sheet

```bash
# ─── New project ───────────────────────────────────────────
floom create my_app                    # interactive wizard
floom create my_app -y                 # defaults, no prompts
floom create my_app -y --org com.acme  # with org

# ─── Generate (inside project) ─────────────────────────────
floom g module auth          # full feature module
floom g mo user              # alias: module
floom g repo profile         # repository + API impl
floom g pg login             # page / view
floom g pr cart              # Riverpod provider
floom g cu cart              # Bloc cubit
floom g s payment            # network service

# ─── Flags ─────────────────────────────────────────────────
floom g page settings -f auth -p ./my_app   # feature + project path
floom feature auth                          # alias for g module

# ─── Help ──────────────────────────────────────────────────
floom --help
floom create --help
floom g --help
floom g module --help
```

## create flags

```
-o, --output <dir>
--org <org>
--architecture clean-architecture|feature-first|mvc|minimal
--state riverpod|bloc|provider|none
--networking dio|http|none
--di none|get_it|injectable
--devices mobile,tablet,desktop
--asset-folders images,icons,fonts,lottie
--no-assets
-y, --defaults
--skip-flutter-create
--skip-pub-get
```

## Default stack (`-y`)

| Layer | Value |
|-------|-------|
| Architecture | Clean Architecture |
| State | Riverpod |
| Networking | Dio |
| DI | None |
| Devices | Mobile + Tablet + Desktop |
| Assets | `images/`, `icons/` |

## generate schematics

| Schematic | Alias | Needs |
|-----------|-------|-------|
| `module` | `mo` | — |
| `repository` | `repo` | feature folder (or creates with module) |
| `page` | `pg` | — |
| `provider` | `pr` | `flutter_riverpod` in pubspec |
| `cubit` | `cu` | `flutter_bloc` in pubspec |
| `service` | `s` | dio/http (`ApiService` in project) |

## Environment

```bash
FLOOM_DEBUG=1 floom create my_app   # verbose logs
```

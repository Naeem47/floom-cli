<p align="center">
  <strong>floom-cli</strong><br/>
  Composable Flutter scaffolder — architecture, state, networking, DI, ScreenUtil & Firebase
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/floom-cli"><img src="https://img.shields.io/npm/v/floom-cli?style=flat-square&color=CB3837" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/floom-cli"><img src="https://img.shields.io/npm/dm/floom-cli?style=flat-square" alt="npm downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License MIT"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-%3E%3D18-green?style=flat-square" alt="Node >=18"></a>
</p>

<p align="center">
  <a href="https://github.com/Naeem47/floom-cli"><strong>GitHub</strong></a> ·
  <a href="https://www.npmjs.com/package/floom-cli"><strong>npm</strong></a> ·
  <a href="CLI_GUIDE.md"><strong>Quick reference</strong></a>
</p>

<p align="center">
  Created by <a href="https://github.com/Naeem47"><strong>Muhammad Naeem</strong></a> ·
  <a href="https://www.linkedin.com/in/naeem-iqbal-965886221">LinkedIn</a>
</p>

---

## Overview

**floom-cli** scaffolds production-ready Flutter apps from composable templates — like NestJS schematics, but for Flutter.

Pick your stack once at create time, then generate features with `floom g module`:

| Layer | Options |
|-------|---------|
| **Architecture** | Clean Architecture · Feature First · MVC · Minimal |
| **State** | Riverpod · Bloc · Provider · None |
| **Networking** | Dio · http · None |
| **DI** | None · get_it · injectable |
| **Firebase** *(optional)* | Auth · Firestore · FCM · Storage · Analytics |
| **Responsive** | ScreenUtil — mobile / tablet / desktop design sizes |

```bash
npm install -g floom-cli
floom create my_app
```

Or without installing:

```bash
npx floom-cli create my_app
```

---

## Features

- **Composable templates** — mix architecture, state, networking, and DI
- **NestJS-style generate** — `floom g module`, `repository`, `page`, `provider`, `cubit`, `service`
- **Smart detection** — schematics match your project's architecture and state library
- **ApiState system** — `ApiResult<T>`, `ApiStateBuilder`, real API calls in repositories
- **ScreenUtil bootstrap** — responsive layout for mobile, tablet, and desktop
- **Firebase addon** — optional Auth, Firestore, FCM, config files, and native setup
- **Auto `flutter pub get`** — dependencies merged into `pubspec.yaml` after generation

---

## Quick start

```bash
# 1. Create a project (interactive wizard)
floom create my_app

# 2. Run the app
cd my_app
flutter run

# 3. Add a feature module
floom g module auth
```

**Fastest path** — defaults (Clean Architecture + Riverpod + Dio):

```bash
floom create my_app -y --org com.mycompany
```

---

## Requirements

| Tool | Version |
|------|---------|
| **Node.js** | 18+ |
| **Flutter SDK** | Latest stable |

---

## Install

```bash
npm install -g floom-cli

# Verify
floom --version
floom --help
```

---

## Commands

```
floom
├── create <name>          Create a new Flutter project
├── generate | g           Generate code in an existing project
│   ├── module | mo        Full feature module
│   ├── repository | repo  Repository + API implementation
│   ├── page | pg          Page / view
│   ├── provider | pr      Riverpod or ChangeNotifier provider
│   ├── cubit | cu         Bloc cubit
│   └── service | s        ApiService wrapper
└── feature <name>         Alias for: floom g module
```

---

## `create` — new project

```bash
floom create <name> [options]
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --output <dir>` | Output directory | `.` |
| `--org <org>` | Flutter org ID | `com.example` |
| `--architecture <id>` | `clean-architecture`, `feature-first`, `mvc`, `minimal` | prompt |
| `--state <id>` | `riverpod`, `bloc`, `provider`, `none` | prompt |
| `--networking <id>` | `dio`, `http`, `none` | prompt |
| `--di <id>` | `none`, `get_it`, `injectable` | prompt |
| `--devices <list>` | `mobile,tablet,desktop` | all three |
| `--asset-folders <list>` | `images,icons,fonts,lottie` | `images,icons` |
| `--no-assets` | Skip asset folders | assets on |
| `--firebase` | Enable Firebase addon | off |
| `--firebase-services <list>` | `auth,firestore,messaging,storage,analytics` | auth + firestore + messaging |
| `-y, --defaults` | Skip prompts | off |
| `--skip-flutter-create` | Template only, no `flutter create` | off |
| `--skip-pub-get` | Skip `flutter pub get` | off |

### Examples

```bash
# Interactive wizard
floom create shop_app

# Defaults
floom create shop_app -y

# MVC + Provider + Dio
floom create shop_app \
  --architecture mvc \
  --state provider \
  --networking dio \
  --org com.myshop \
  -y

# With Firebase (Auth + Firestore + FCM)
floom create shop_app \
  --firebase-services auth,firestore,messaging \
  -y
```

---

## `generate` — add code

Floom **auto-detects** architecture and state from `pubspec.yaml` and `lib/`.

```bash
floom g module auth
floom g repository profile --feature user
floom g page login --feature auth
floom g provider cart      # Riverpod or Provider package
floom g cubit cart         # Bloc projects
floom g service payment    # requires dio/http
```

| Command | Alias | Description |
|---------|-------|-------------|
| `floom g module <name>` | `mo` | Full feature module |
| `floom g repository <name>` | `repo` | Repository + API impl |
| `floom g page <name>` | `pg` | Page / view |
| `floom g provider <name>` | `pr` | State provider / notifier |
| `floom g cubit <name>` | `cu` | Bloc cubit |
| `floom g service <name>` | `s` | ApiService wrapper |

---

## Firebase (optional addon)

Enable during `floom create` — interactive prompt or CLI flags.

| Service | Package | Scaffolded files |
|---------|---------|----------------|
| **Core** | `firebase_core` | `firebase_options.dart`, bootstrap init |
| **Auth** | `firebase_auth` | `firebase_auth_service.dart` |
| **Firestore** | `cloud_firestore` | `firestore_service.dart` |
| **Messaging** | `firebase_messaging` | FCM service + background handler |
| **Storage** | `firebase_storage` | `firebase_storage_service.dart` |
| **Analytics** | `firebase_analytics` | `firebase_analytics_service.dart` |

Also scaffolds:

- `firebase.json`
- `android/app/google-services.json` *(placeholder)*
- `ios/Runner/GoogleService-Info.plist` *(placeholder)*
- Android Gradle patches for Google Services

```bash
floom create my_app --firebase-services auth,firestore,messaging -y

cd my_app
dart pub global activate flutterfire_cli
flutterfire configure
flutter run
```

> Replace placeholder config with real credentials via `flutterfire configure`.

---

## Interactive wizard

```
? Architecture          ❯ Clean Architecture
? State Management      ❯ Riverpod / Bloc / Provider / None
? Networking            ❯ Dio / http / None
? Dependency Injection  ❯ None / get_it / injectable
? Enable Firebase?      Yes / No
? Firebase services     ◉ Auth  ◉ Firestore  ◉ FCM
? Target devices        ◉ Mobile  ◉ Tablet  ◉ Desktop
? Asset folders         ◉ images  ◉ icons
```

---

## What you get

Every generated project includes:

- `bootstrapApp()` — DI + ScreenUtil + optional Firebase init
- `AppScreenUtil` — responsive design sizes
- `ApiState` enum — `initial` · `loading` · `success` · `error`
- `ApiResult<T>` + `ApiStateBuilder` — unified loading UI
- `ApiEndpoints` — central API path constants
- Repository impls with real `ApiService.get()` calls (dio/http)
- Auto `flutter pub get`

### Sample layout (Clean Architecture + Riverpod + Dio)

```
lib/
├── core/
│   ├── bootstrap/
│   ├── constants/
│   ├── di/
│   ├── network/
│   ├── responsive/
│   └── router/
├── features/
│   └── home/
│       ├── domain/
│       ├── data/
│       └── presentation/
├── shared/widgets/
└── main.dart
```

---

## Examples

### E-commerce (Bloc + Dio + get_it)

```bash
floom create shop_app --state bloc --networking dio --di get_it -y
cd shop_app
floom g module product
floom g module cart
flutter run
```

### MVP (MVC + Provider)

```bash
floom create mvp_app --architecture mvc --state provider -y
cd mvp_app
floom g module onboarding
flutter run
```

### Firebase app

```bash
floom create chat_app --firebase-services auth,firestore,messaging -y
cd chat_app
flutterfire configure
flutter run
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `floom: command not found` | Run `npm install -g floom-cli` and restart terminal |
| Missing dependencies in `pubspec.yaml` | Update floom-cli; deps are injected after `flutter create` |
| Module generates wrong state library | Update floom-cli; detection uses pubspec + home feature files |
| Firebase placeholders | Run `flutterfire configure` to replace config files |
| Debug logs | `FLOOM_DEBUG=1 floom create my_app` |

---

## Development

```bash
git clone https://github.com/Naeem47/floom-cli.git
cd floom-cli
npm install
npm run build
npm link
npm test
```

---

## Author

**Muhammad Naeem**

- GitHub: [@Naeem47](https://github.com/Naeem47)
- LinkedIn: [naeem-iqbal-965886221](https://www.linkedin.com/in/naeem-iqbal-965886221)

---

## License

[MIT](LICENSE) © [Muhammad Naeem](https://github.com/Naeem47)

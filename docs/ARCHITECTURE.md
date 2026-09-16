# Architecture du projet Finder

## 1. Arborescence actuelle

C:.
└───finder
├───api
│ ├───finder-data
│ ├───node_modules
│ │ ├───.bin
│ │ ├───accepts
│ │ ├───anymatch
│ │ ├───balanced-match
│ │ │ └───dist
│ │ │ ├───commonjs
│ │ │ └───esm
│ │ ├───binary-extensions
│ │ ├───body-parser
│ │ │ ├───lib
│ │ │ │ └───types
│ │ │ └───node_modules
│ │ │ └───content-type
│ │ │ └───dist
│ │ ├───brace-expansion
│ │ │ └───dist
│ │ │ ├───commonjs
│ │ │ └───esm
│ │ ├───braces
│ │ │ └───lib
│ │ ├───bytes
│ │ ├───call-bind-apply-helpers
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───call-bound
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───chokidar
│ │ │ ├───lib
│ │ │ └───types
│ │ ├───content-disposition
│ │ ├───content-type
│ │ ├───cookie
│ │ ├───cookie-signature
│ │ ├───debug
│ │ │ └───src
│ │ ├───depd
│ │ │ └───lib
│ │ │ └───browser
│ │ ├───dotenv
│ │ │ ├───lib
│ │ │ └───skills
│ │ │ ├───dotenv
│ │ │ └───dotenvx
│ │ ├───dunder-proto
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───ee-first
│ │ ├───encodeurl
│ │ ├───es-define-property
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───es-errors
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───es-object-atoms
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───escape-html
│ │ ├───etag
│ │ ├───express
│ │ │ └───lib
│ │ ├───fill-range
│ │ ├───finalhandler
│ │ ├───forwarded
│ │ ├───fresh
│ │ ├───function-bind
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───get-intrinsic
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───get-proto
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───glob-parent
│ │ ├───gopd
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───has-flag
│ │ ├───has-symbols
│ │ │ ├───.github
│ │ │ └───test
│ │ │ └───shams
│ │ ├───hasown
│ │ │ └───.github
│ │ ├───http-errors
│ │ ├───iconv-lite
│ │ │ ├───encodings
│ │ │ │ └───tables
│ │ │ ├───lib
│ │ │ │ └───helpers
│ │ │ └───types
│ │ ├───ignore-by-default
│ │ ├───inherits
│ │ ├───ipaddr.js
│ │ │ └───lib
│ │ ├───is-binary-path
│ │ ├───is-extglob
│ │ ├───is-glob
│ │ ├───is-number
│ │ ├───is-promise
│ │ ├───math-intrinsics
│ │ │ ├───.github
│ │ │ ├───constants
│ │ │ └───test
│ │ ├───media-typer
│ │ ├───merge-descriptors
│ │ ├───mime-db
│ │ ├───mime-types
│ │ ├───minimatch
│ │ │ └───dist
│ │ │ ├───commonjs
│ │ │ └───esm
│ │ ├───ms
│ │ ├───negotiator
│ │ │ ├───lib
│ │ │ └───node_modules
│ │ │ └───content-type
│ │ │ └───dist
│ │ ├───nodemon
│ │ │ ├───bin
│ │ │ ├───doc
│ │ │ │ └───cli
│ │ │ └───lib
│ │ │ ├───cli
│ │ │ ├───config
│ │ │ ├───help
│ │ │ ├───monitor
│ │ │ ├───rules
│ │ │ └───utils
│ │ ├───normalize-path
│ │ ├───object-inspect
│ │ │ ├───.github
│ │ │ ├───example
│ │ │ └───test
│ │ │ └───browser
│ │ ├───on-finished
│ │ ├───once
│ │ ├───parseurl
│ │ ├───path-to-regexp
│ │ │ └───dist
│ │ ├───picomatch
│ │ │ └───lib
│ │ ├───proxy-addr
│ │ ├───pstree.remy
│ │ │ ├───lib
│ │ │ └───tests
│ │ │ └───fixtures
│ │ ├───qs
│ │ │ ├───.github
│ │ │ ├───dist
│ │ │ ├───lib
│ │ │ └───test
│ │ ├───range-parser
│ │ ├───raw-body
│ │ ├───readdirp
│ │ ├───router
│ │ │ └───lib
│ │ ├───safer-buffer
│ │ ├───semver
│ │ │ ├───bin
│ │ │ ├───classes
│ │ │ ├───functions
│ │ │ ├───internal
│ │ │ └───ranges
│ │ ├───send
│ │ ├───serve-static
│ │ ├───setprototypeof
│ │ │ └───test
│ │ ├───side-channel
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───side-channel-list
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───side-channel-map
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───side-channel-weakmap
│ │ │ ├───.github
│ │ │ └───test
│ │ ├───simple-update-notifier
│ │ │ ├───build
│ │ │ └───src
│ │ ├───statuses
│ │ ├───supports-color
│ │ ├───to-regex-range
│ │ ├───toidentifier
│ │ ├───touch
│ │ │ └───bin
│ │ ├───type-is
│ │ │ └───node_modules
│ │ │ └───content-type
│ │ │ └───dist
│ │ ├───undefsafe
│ │ │ ├───.github
│ │ │ │ └───workflows
│ │ │ └───lib
│ │ ├───unpipe
│ │ ├───vary
│ │ └───wrappy
│ ├───src
│ └───tests
├───docs
│ └───rgpd
├───front
│ └───src
└───script

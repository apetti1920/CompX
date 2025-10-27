# Quick Start - Running Tests

## Install Dependencies

```bash
# From project root
npm run bootstrap

# Or from web_app package
cd packages/web_app
npm install
```

## Run Tests

### All Tests
```bash
npm test
```

### Specific Test File
```bash
npm test graphreducers.addblock
npm test coordinates
npm test graphactions
```

### With Coverage Report
```bash
npm test:coverage
```
Then open `packages/web_app/__tests__/coverage/index.html` in your browser.

### Watch Mode (Auto-rerun on changes)
```bash
npm test:watch
```

## Expected Output

All tests should pass:
```
PASS  __tests__/store/actions/graphactions.test.ts
PASS  __tests__/store/reducers/graphreducers.addblock.test.ts
PASS  __tests__/helpers/coordinates.test.ts

Test Suites: 3 passed, 3 total
Tests:       56 passed, 56 total
Snapshots:   0 total
Time:        3.456 s
```

## Troubleshooting

### "Cannot find module '@compx/common'"
```bash
# From project root
npm run bootstrap
```

### "Jest not found"
```bash
cd packages/web_app
npm install
```

### TypeScript errors
```bash
# Rebuild common package
cd packages/common
npm run build
```

## Test Structure

```
__tests__/
├── jest.config.ts              # Jest configuration
├── setupTests.ts               # Test environment setup
├── README.md                   # Full documentation
├── QUICK_START.md             # This file
├── store/
│   ├── actions/
│   │   └── graphactions.test.ts
│   └── reducers/
│       └── graphreducers.addblock.test.ts
└── helpers/
    └── coordinates.test.ts
```

## Coverage Goals

All metrics at 100%:
- ✅ Statements
- ✅ Branches
- ✅ Functions
- ✅ Lines

See `TEST_COVERAGE_SUMMARY.md` for detailed coverage information.

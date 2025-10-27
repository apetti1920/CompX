# CompX Web App Test Suite

## Overview

This test suite provides comprehensive coverage for the drag-and-drop block library functionality implemented in the `3p0q63t_block_library` branch.

## Test Structure

```
__tests__/
├── jest.config.ts          # Jest configuration
├── setupTests.ts           # Test environment setup
├── store/
│   ├── actions/
│   │   └── graphactions.test.ts           # Action creator tests
│   └── reducers/
│       └── graphreducers.addblock.test.ts # ADD_BLOCK reducer tests
└── helpers/
    └── coordinates.test.ts                # Coordinate transformation tests
```

## Test Coverage

### 1. Redux Action Creator Tests (`graphactions.test.ts`)

Tests for the `AddBlockAction` action creator:

- ✅ Action type correctness
- ✅ Payload structure validation
- ✅ BlockTemplate preservation
- ✅ Position handling
- ✅ Multiple action creation

**Coverage**: 100% of AddBlockAction functionality

### 2. Redux Reducer Tests (`graphreducers.addblock.test.ts`)

Comprehensive tests for the ADD_BLOCK reducer case:

#### Block Creation (5 tests)
- Block structure validation
- Unique ID generation (block + ports)
- Multiple block handling
- No ID conflicts

#### Port Handling (1 test)
- Multi-port template preservation
- Port property correctness
- Initial values preservation

#### Error Handling (3 tests)
- Missing blockTemplate handling
- Null blockTemplate handling
- Undefined blockTemplate handling
- Console warning verification

#### Position Handling (4 tests)
- Positive coordinates
- Negative coordinates
- Zero coordinates
- Large coordinate values

#### State Immutability (2 tests)
- Original state preservation
- New state object creation
- Deep cloning verification

**Coverage**: 100% of ADD_BLOCK reducer logic

### 3. Coordinate Transformation Tests (`coordinates.test.ts`)

Extensive tests for the `ScreenToWorld` helper function:

#### Basic Transformations (3 tests)
- Screen center to world origin
- Corner coordinate mapping
- Coordinate system verification

#### Zoom Transformations (4 tests)
- Zoom in (>1.0) scaling
- Zoom out (<1.0) scaling
- Very high zoom levels (10x)
- Very low zoom levels (0.1x)

#### Translation Transformations (3 tests)
- Positive translation
- Negative translation
- Large translation values

#### Combined Operations (2 tests)
- Zoom + translation combinations
- Complex transformation scenarios

#### Y-Axis Inversion (2 tests)
- Screen-to-world Y-axis flip
- Y-inversion with zoom

#### Edge Cases (3 tests)
- Zero-sized screen handling
- Very small zoom values
- Non-square dimensions

#### Real-World Scenarios (4 tests)
- Drop at default position
- Drop after panning
- Drop after zooming
- Drop with zoom + pan

**Coverage**: 100% of ScreenToWorld functionality

## Running Tests

### Run All Tests
```bash
cd packages/web_app
npm test
```

### Run Specific Test Suite
```bash
npm test graphreducers.addblock
npm test coordinates
npm test graphactions
```

### Run with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Dependencies

The test suite uses:
- **Jest**: Test framework
- **@testing-library/jest-dom**: DOM matchers
- **ts-jest**: TypeScript support
- **identity-obj-proxy**: CSS module mocking

## Key Testing Patterns

### 1. State Immutability
All reducer tests verify that:
- Original state is never mutated
- New state objects are created
- Deep cloning works correctly

### 2. Unique ID Generation
Tests verify UUID generation for:
- Block IDs
- Input port IDs
- Output port IDs
- No ID collisions

### 3. Coordinate Precision
Coordinate tests use:
- `toBeCloseTo(value, decimals)` for floating-point comparisons
- 5 decimal places for standard precision
- 2 decimal places for complex calculations

### 4. Error Handling
All error cases include:
- Console.warn spy verification
- State preservation checks
- Warning message validation

## Coverage Goals

Current coverage targets:
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

## Future Test Additions

Consider adding:
1. **Component Tests**: React Testing Library tests for:
   - CardComponent drag behavior
   - LibraryViewer rendering
   - CanvasContainer drop handling

2. **Integration Tests**: End-to-end tests for:
   - Complete drag-and-drop flow
   - Multi-block scenarios
   - Edge placement validation

3. **Performance Tests**: Benchmarks for:
   - Coordinate transformation speed
   - Reducer execution time
   - Large graph handling

## Contributing

When adding new features to the drag-and-drop functionality:

1. **Write tests first** (TDD approach)
2. **Achieve 100% coverage** for new code
3. **Test edge cases** thoroughly
4. **Update this README** with new test descriptions

## Troubleshooting

### Module Resolution Issues
If you see errors like "Cannot find module '@compx/common'":
```bash
# From project root
npm run bootstrap
```

### Canvas API Errors
HTMLCanvasElement mocking is configured in `setupTests.ts`. If you encounter canvas-related errors, verify the mock is properly loaded.

### TypeScript Errors
Ensure `tsconfig.json` includes test files:
```json
{
  "include": ["src/**/*", "__tests__/**/*"]
}
```

## Notes

- All tests are written in TypeScript
- Tests follow Jest best practices
- Console warnings are mocked to prevent test output pollution
- Floating-point comparisons use `toBeCloseTo()` for reliability
